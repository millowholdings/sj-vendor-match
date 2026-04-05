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

function buildEventRow(ev, zip) {
  const dist = distanceMiles(zip, ev.zip);
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
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Supabase credentials not configured' });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);
  const fromAddr = 'hello@southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://southjerseyvendormarket.com';

  const today = new Date().toISOString().split('T')[0];
  const twoWeeksOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Load upcoming approved events
  const { data: events, error: evErr } = await supabase
    .from('events').select('*')
    .gte('date', today).lte('date', twoWeeksOut)
    .order('date', { ascending: true });

  if (evErr) {
    console.error('Failed to load events:', evErr);
    return res.status(500).json({ error: 'Failed to load events' });
  }

  // Filter to approved/concierge_active only
  const approvedEvents = (events || []).filter(e => !e.status || e.status === 'approved' || e.status === 'concierge_active');

  if (approvedEvents.length === 0) {
    return res.status(200).json({ message: 'No upcoming events', emailsSent: 0 });
  }

  let emailsSent = 0;
  const errors = [];

  // ─── Send to Vendors ──────────────────────────────────────────────────────
  let vendors;
  const { data: vendorRows, error: vErr } = await supabase
    .from('vendors').select('*').eq('status', 'approved');
  if (vErr && vErr.code === '42703') {
    const fallback = await supabase.from('vendors').select('*');
    vendors = fallback.data;
  } else {
    vendors = vendorRows;
  }

  for (const vendor of (vendors || [])) {
    if (!vendor.contact_email) continue;
    const vendorCats = vendor.metadata?.allCategories || [vendor.category];
    const vendorZip = vendor.home_zip;
    const vendorRadius = vendor.radius || 20;

    const matched = approvedEvents.filter(ev => {
      const evCats = ev.categories_needed || [];
      const catMatch = evCats.length === 0 || evCats.some(c => vendorCats.includes(c));
      if (!catMatch) return false;
      const dist = distanceMiles(vendorZip, ev.zip);
      if (dist === null) return true;
      return dist <= vendorRadius;
    });

    if (matched.length === 0) continue;

    const eventRows = matched.map(ev => buildEventRow(ev, vendorZip)).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px"><div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div><div style="font-size:13px;color:#a89a8a;margin-top:4px">Weekly Opportunity Digest</div></div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center"><div style="font-size:18px;color:#e8c97a;font-weight:700">${matched.length} Event${matched.length !== 1 ? 's' : ''} Near You</div><div style="font-size:13px;color:#a89a8a;margin-top:6px">Matching ${vendorCats.join(', ')} within ${vendorRadius}mi of ${vendorZip}</div></div>
      <table style="width:100%;border-collapse:collapse">${eventRows}</table>
      <div style="padding:20px 28px;text-align:center;border-top:1px solid #f0e8dc"><a href="${siteUrl}/opportunities" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">View All Opportunities</a></div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a">South Jersey Vendor Market &middot; Weekly digest for ${vendor.name}</div>
  </div>
</body></html>`;

    try {
      const { error: sendErr } = await resend.emails.send({
        from: `South Jersey Vendor Market <${fromAddr}>`,
        to: [vendor.contact_email],
        subject: `${matched.length} new event${matched.length !== 1 ? 's' : ''} near you — South Jersey Vendor Market`,
        html,
      });
      if (sendErr) { errors.push({ type: 'vendor', name: vendor.name, error: sendErr.message }); }
      else { emailsSent++; }
    } catch (err) { errors.push({ type: 'vendor', name: vendor.name, error: err.message }); }
  }

  // ─── Send to Event Guests ─────────────────────────────────────────────────
  const { data: goers } = await supabase.from('event_goers').select('*').eq('active', true);

  // Determine if this is a biweekly week (even week number)
  const weekNum = Math.floor((Date.now() - new Date('2026-01-01').getTime()) / (7*24*60*60*1000));
  const isBiweeklyWeek = weekNum % 2 === 0;

  for (const goer of (goers || [])) {
    if (!goer.email) continue;
    // Skip biweekly subscribers on odd weeks
    if (goer.email_frequency === 'none') continue;
    if (goer.email_frequency === 'biweekly' && !isBiweeklyWeek) continue;

    const goerZip = goer.zip;
    const goerRadius = goer.radius || 20;
    const goerTypes = goer.event_types || [];

    const matched = approvedEvents.filter(ev => {
      // Event type match
      const typeMatch = goerTypes.length === 0 || goerTypes.includes(ev.event_type);
      if (!typeMatch) return false;
      // Distance match
      const dist = distanceMiles(goerZip, ev.zip);
      if (dist === null) return true;
      return dist <= goerRadius;
    });

    if (matched.length === 0) continue;

    const eventRows = matched.map(ev => {
      const dist = distanceMiles(goerZip, ev.zip);
      const distStr = dist !== null ? `${dist.toFixed(1)} mi away` : '';
      const timeStr = ev.start_time ? fmtTime(ev.start_time) + (ev.end_time ? ' – ' + fmtTime(ev.end_time) : '') : '';
      const ticketStr = ev.is_ticketed ? (ev.ticket_price ? 'Tickets: ' + ev.ticket_price : 'Ticketed') : 'Free admission';
      return `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #f0e8dc">
            <div style="font-weight:700;font-size:15px;color:#1a1410;margin-bottom:3px">${ev.event_name || ev.event_type}</div>
            <div style="font-size:13px;color:#7a6a5a;line-height:1.5">
              ${ev.event_type ? '<span style="display:inline-block;background:#f5f0ea;border:1px solid #e8ddd0;border-radius:12px;padding:1px 8px;font-size:11px;margin-right:6px">' + ev.event_type + '</span>' : ''}
              ${fmtDate(ev.date)}${timeStr ? ' &middot; ' + timeStr : ''}
              ${ev.zip ? ' &middot; ' + ev.zip : ''}${distStr ? ' (' + distStr + ')' : ''}
            </div>
            <div style="font-size:12px;color:#a89a8a;margin-top:2px">${ticketStr}</div>
          </td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px"><div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div><div style="font-size:13px;color:#a89a8a;margin-top:4px">Your Event Digest</div></div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center"><div style="font-size:18px;color:#e8c97a;font-weight:700">${matched.length} Market${matched.length !== 1 ? 's' : ''} Near You!</div><div style="font-size:13px;color:#a89a8a;margin-top:6px">Within ${goerRadius} miles of ${goerZip}</div></div>
      <table style="width:100%;border-collapse:collapse">${eventRows}</table>
      <div style="padding:20px 28px;text-align:center;border-top:1px solid #f0e8dc"><a href="${siteUrl}/upcoming-markets" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">Browse All Events</a></div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a">South Jersey Vendor Market &middot; ${goer.email_frequency === 'weekly' ? 'Weekly' : 'Biweekly'} digest for ${goer.name}</div>
  </div>
</body></html>`;

    try {
      const { error: sendErr } = await resend.emails.send({
        from: `South Jersey Vendor Market <${fromAddr}>`,
        to: [goer.email],
        subject: `${matched.length} market${matched.length !== 1 ? 's' : ''} near you this week!`,
        html,
      });
      if (sendErr) { errors.push({ type: 'event_guest', name: goer.name, error: sendErr.message }); }
      else { emailsSent++; }
    } catch (err) { errors.push({ type: 'event_guest', name: goer.name, error: err.message }); }
  }

  return res.status(200).json({
    message: 'Weekly digest sent',
    emailsSent,
    totalVendors: (vendors || []).length,
    totalEventGuests: (goers || []).length,
    totalEvents: approvedEvents.length,
    errors: errors.length > 0 ? errors : undefined,
  });
};
