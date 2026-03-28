const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Email service not configured' });

  const { eventName, hostName, hostEmail, eventDate, eventType, eventZip, isConcierge } = req.body;
  if (!eventName) return res.status(400).json({ error: 'Missing eventName' });

  const resend = new Resend(resendKey);
  const fromAddr = 'hello@southjerseyvendormarket.com';
  const adminEmail = 'tiffany@southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://southjerseyvendormarket.com';

  const fmtDate = (d) => {
    if (!d) return 'TBD';
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
  };

  const subject = `New Event Pending Review: ${eventName}${isConcierge ? ' [CONCIERGE]' : ''}`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
      <div style="font-size:13px;color:#a89a8a;margin-top:4px">New Event Submission</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">New Event Pending Review</div>
        ${isConcierge ? '<div style="font-size:13px;color:#c8a84b;margin-top:4px">⭐ Concierge Request</div>' : ''}
      </div>
      <div style="padding:24px 28px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600;width:120px">Event Name</td><td style="padding:8px 0;font-size:14px;color:#1a1410;font-weight:700">${eventName}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Host</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${hostName || '—'}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Host Email</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${hostEmail || '—'}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Event Date</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${fmtDate(eventDate)}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Event Type</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${eventType || '—'}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Location</td><td style="padding:8px 0;font-size:14px;color:#1a1410">Zip ${eventZip || '—'}</td></tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="${siteUrl}/admin" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">Review in Admin Panel</a>
        </div>
        <div style="text-align:center;margin-top:12px;font-size:12px;color:#a89a8a">
          Click the button above to approve or reject this event.
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Connecting local vendors with event hosts
    </div>
  </div>
</body></html>`;

  // Log to database
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try { const sb = createClient(supabaseUrl, supabaseKey); await sb.from('email_log').insert({ to_email: adminEmail, subject, email_type: 'event_admin_notification' }); } catch(e) {}
  }

  try {
    const { error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [adminEmail],
      subject,
      html,
    });
    if (error) { console.error('Event admin notification error:', error); return res.status(500).json({ error: 'Failed' }); }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Event admin notification error:', err);
    return res.status(500).json({ error: 'Failed' });
  }
};
