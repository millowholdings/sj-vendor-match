const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Email service not configured' });

  const { hostEmail, hostName, vendorName, vendorCategory, eventName, eventDate, status, vendorMessage } = req.body;
  if (!hostEmail || !status) return res.status(400).json({ error: 'Missing required fields' });

  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'hello@send.southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  const accepted = status === 'accepted';
  const subject = accepted
    ? `Booking Accepted: ${vendorName || 'A vendor'} accepted your request for ${eventName || 'your event'}`
    : `Booking Update: ${vendorName || 'A vendor'} declined your request for ${eventName || 'your event'}`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">${accepted ? 'Booking Accepted!' : 'Booking Update'}</div>
      </div>
      <div style="padding:24px 28px">
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">Hi ${hostName || 'there'},</p>
        ${accepted ? `
        <div style="background:#d4f4e0;border:1px solid #b8e8c8;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <div style="font-size:16px;color:#1a6b3a;font-weight:700">✓ ${vendorName || 'A vendor'} accepted!</div>
          <div style="font-size:13px;color:#2d7a50;margin-top:4px">${vendorCategory ? vendorCategory + ' · ' : ''}${eventName || 'Your event'}${eventDate ? ' · ' + eventDate : ''}</div>
        </div>
        <p style="font-size:14px;color:#1a1410;line-height:1.6">Their contact information is now available in your Messages. You can coordinate event details directly.</p>
        ` : `
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Unfortunately, <strong>${vendorName || 'a vendor'}</strong> has declined your booking request for <strong>${eventName || 'your event'}</strong>.
        </p>
        ${vendorMessage ? `<div style="background:#fdf9f5;border:1px solid #e8ddd0;border-radius:8px;padding:12px;margin:16px 0;font-size:13px;color:#7a6a5a;font-style:italic">"${vendorMessage}"</div>` : ''}
        <p style="font-size:14px;color:#1a1410;line-height:1.6">Don't worry — there are plenty of great vendors on the platform. Browse the vendor directory to find another match.</p>
        `}
        <div style="text-align:center;margin:24px 0">
          <a href="${siteUrl}/${accepted ? 'messages' : 'matches'}" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">
            ${accepted ? 'View in Messages' : 'Browse More Vendors'}
          </a>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Connecting local vendors with event hosts<br>
      Questions? Email us at <a href="mailto:support@southjerseyvendormarket.com" style="color:#a89a8a">support@southjerseyvendormarket.com</a>
    </div>
  </div>
</body></html>`;

  // Log to database
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('email_log').insert({ to_email: hostEmail, subject, email_type: `booking_${status}` });
    } catch (e) { console.error('Email log error:', e); }
  }

  try {
    const { error } = await resend.emails.send({ from: `South Jersey Vendor Market <${fromAddr}>`, to: [hostEmail], subject, html });
    if (error) { console.error('Booking response email error:', error); return res.status(500).json({ error: 'Failed' }); }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Booking response email error:', err);
    return res.status(500).json({ error: 'Failed' });
  }
};
