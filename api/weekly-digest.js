const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

// ─── Zip coordinates for distance matching ──────────────────────────────────
const ZIP_COORDS = {
  "08002":[39.934,-75.014],"08003":[39.901,-74.974],"08004":[39.793,-74.760],
  "08007":[39.868,-75.061],"08009":[39.788,-74.947],"08012":[39.778,-75.044],
  "08021":[39.810,-75.018],"08026":[39.821,-74.977],"08029":[39.809,-75.057],
  "08030":[39.889,-75.122],"08033":[39.893,-75.036],"08034":[39.913,-74.997],
  "08035":[39.884,-75.052],"08036":[39.957,-74.836],"08043":[39.855,-74.971],
  "08045":[39.857,-75.037],"08048":[39.951,-74.804],"08052":[39.946,-74.999],
  "08053":[39.896,-74.919],"08054":[39.952,-74.936],"08055":[39.827,-74.772],
  "08057":[39.956,-74.951],"08059":[39.903,-75.055],"08060":[40.019,-74.800],
  "08063":[39.821,-75.220],"08065":[39.950,-75.050],"08075":[40.025,-74.950],
  "08077":[39.977,-75.017],"08078":[39.849,-75.065],"08080":[39.804,-75.115],
  "08081":[39.741,-74.992],"08083":[39.840,-75.020],"08086":[39.851,-75.180],
  "08088":[39.889,-74.697],"08089":[39.776,-74.870],"08090":[39.832,-75.117],
  "08091":[39.771,-74.972],"08093":[39.871,-75.140],"08094":[39.729,-74.982],
  "08096":[39.825,-75.127],"08097":[39.849,-75.137],"08101":[39.931,-75.120],
  "08102":[39.945,-75.112],"08103":[39.931,-75.100],"08104":[39.922,-75.090],
  "08105":[39.937,-75.082],"08106":[39.910,-75.047],"08107":[39.920,-75.062],
  "08108":[39.910,-75.027],"08109":[39.945,-75.070],"08110":[39.965,-75.037],
  "08226":[39.297,-74.592],"08232":[39.386,-74.526],"08244":[39.506,-74.454],
  "08401":[39.364,-74.423],"08402":[39.327,-74.511],"08406":[39.341,-74.451]
};

function distanceMiles(zip1, zip2) {
  const c1 = ZIP_COORDS[zip1], c2 = ZIP_COORDS[zip2];
  if (!c1 || !c2) return null;
  const R = 3958.8;
  const dLat = (c2[0] - c1[0]) * Math.PI / 180;
  const dLon = (c2[1] - c1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(c1[0]*Math.PI/180) * Math.cos(c2[0]*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
}

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}

module.exports = async function handler(req, res) {
  // Accept GET (cron) or POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret if configured (optional security)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Supabase credentials not configured' });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'bookings@southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  // Get events created in the last 7 days that are still in the future
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().split('T')[0];

  const { data: events, error: evErr } = await supabase
    .from('events').select('*')
    .gte('created_at', sevenDaysAgo)
    .gte('date', today)
    .order('date', { ascending: true });

  if (evErr) {
    console.error('Failed to load events:', evErr);
    return res.status(500).json({ error: 'Failed to load events' });
  }

  if (!events || events.length === 0) {
    return res.status(200).json({ message: 'No new events this week', emailsSent: 0 });
  }

  // Get all approved vendors with emails
  let vendors;
  const { data: vendorRows, error: vErr } = await supabase
    .from('vendors').select('*').eq('status', 'approved');

  if (vErr && vErr.code === '42703') {
    // status column doesn't exist — load all vendors
    const fallback = await supabase.from('vendors').select('*');
    vendors = fallback.data;
  } else {
    vendors = vendorRows;
  }

  if (!vendors || vendors.length === 0) {
    return res.status(200).json({ message: 'No vendors to notify', emailsSent: 0 });
  }

  // Match events to each vendor by category + distance/radius
  let emailsSent = 0;
  const errors = [];

  for (const vendor of vendors) {
    if (!vendor.contact_email) continue;

    const vendorCats = vendor.metadata?.allCategories || [vendor.category];
    const vendorZip = vendor.home_zip;
    const vendorRadius = vendor.radius || 20;

    const matched = events.filter(ev => {
      // Category match: event needs at least one category the vendor offers,
      // or event has no category filter (accepts all)
      const evCats = ev.categories_needed || [];
      const catMatch = evCats.length === 0 || evCats.some(c => vendorCats.includes(c));
      if (!catMatch) return false;

      // Distance match
      const dist = distanceMiles(vendorZip, ev.zip);
      if (dist === null) return true; // unknown zip — include as possible match
      return dist <= vendorRadius;
    });

    if (matched.length === 0) continue;

    // Build email
    const eventRows = matched.map(ev => {
      const dist = distanceMiles(vendorZip, ev.zip);
      const distStr = dist !== null ? `${dist.toFixed(1)} mi away` : '';
      const timeStr = ev.start_time ? fmtTime(ev.start_time) + (ev.end_time ? ' – ' + fmtTime(ev.end_time) : '') : '';
      return `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #f0e8dc">
            <div style="font-weight:700;font-size:15px;color:#1a1410;margin-bottom:3px">${ev.event_name || ev.event_type}</div>
            <div style="font-size:13px;color:#7a6a5a;line-height:1.5">
              ${ev.event_type ? '<span style="display:inline-block;background:#f5f0ea;border:1px solid #e8ddd0;border-radius:12px;padding:1px 8px;font-size:11px;margin-right:6px">' + ev.event_type + '</span>' : ''}
              ${fmtDate(ev.date)}${timeStr ? ' &middot; ' + timeStr : ''}
              ${ev.zip ? ' &middot; ' + ev.zip : ''}${distStr ? ' (' + distStr + ')' : ''}
            </div>
            ${ev.booth_fee ? '<div style="font-size:12px;color:#a89a8a;margin-top:2px">Booth fee: ' + ev.booth_fee + '</div>' : ''}
            ${ev.spots ? '<div style="font-size:12px;color:#a89a8a">' + ev.spots + ' vendor spots</div>' : ''}
          </td>
        </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410;letter-spacing:-0.5px">South Jersey Vendor Market</div>
      <div style="font-size:13px;color:#a89a8a;margin-top:4px">Weekly Opportunity Digest</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:36px;margin-bottom:8px">🎪</div>
        <div style="font-size:18px;color:#e8c97a;font-weight:700">${matched.length} New Event${matched.length !== 1 ? 's' : ''} Near You</div>
        <div style="font-size:13px;color:#a89a8a;margin-top:6px">
          Events matching ${vendorCats.join(', ')} within ${vendorRadius} miles of ${vendorZip}
        </div>
      </div>
      <div style="padding:0">
        <table style="width:100%;border-collapse:collapse">
          ${eventRows}
        </table>
      </div>
      <div style="padding:20px 28px;text-align:center;border-top:1px solid #f0e8dc">
        <a href="${siteUrl}" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">
          View All Opportunities
        </a>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Weekly digest for ${vendor.name}<br>
      You're receiving this because you're a registered vendor on our platform.
    </div>
  </div>
</body>
</html>`;

    try {
      const { error: sendErr } = await resend.emails.send({
        from: `South Jersey Vendor Market <${fromAddr}>`,
        to: [vendor.contact_email],
        subject: `${matched.length} new event${matched.length !== 1 ? 's' : ''} near you this week — South Jersey Vendor Market`,
        html,
      });
      if (sendErr) {
        console.error(`Email error for ${vendor.contact_email}:`, sendErr);
        errors.push({ vendor: vendor.name, error: sendErr.message });
      } else {
        emailsSent++;
      }
    } catch (err) {
      console.error(`Email exception for ${vendor.contact_email}:`, err);
      errors.push({ vendor: vendor.name, error: err.message });
    }
  }

  return res.status(200).json({
    message: `Weekly digest sent`,
    emailsSent,
    totalVendors: vendors.length,
    totalNewEvents: events.length,
    errors: errors.length > 0 ? errors : undefined,
  });
};
