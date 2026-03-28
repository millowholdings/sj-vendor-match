const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Email service not configured' });

  const { email, name, zip, radius, eventTypes, frequency } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'hello@send.southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  const typesStr = (eventTypes || []).join(', ') || 'All event types';
  const freqStr = frequency === 'none' ? 'No email alerts' : frequency === 'biweekly' ? 'Every 2 weeks' : 'Weekly';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">Welcome, ${name || 'Event Explorer'}!</div>
        <div style="font-size:13px;color:#a89a8a;margin-top:4px">You're all set to discover local events</div>
      </div>
      <div style="padding:24px 28px">
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Thanks for signing up as an Event Guest on South Jersey Vendor Market! Here are your preferences:
        </p>
        <div style="background:#fdf9f5;border:1px solid #e8ddd0;border-radius:8px;padding:16px;margin:16px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;font-size:13px;color:#a89a8a;font-weight:600;width:100px">Location</td><td style="padding:6px 0;font-size:14px;color:#1a1410">Zip ${zip || '—'} (${radius || 20} mile radius)</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#a89a8a;font-weight:600">Events</td><td style="padding:6px 0;font-size:14px;color:#1a1410">${typesStr}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#a89a8a;font-weight:600">Alerts</td><td style="padding:6px 0;font-size:14px;color:#1a1410">${freqStr}</td></tr>
          </table>
        </div>
        ${frequency !== 'none' ? `<p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">We'll send you a personalized list of upcoming events matching your preferences ${freqStr.toLowerCase()}.</p>` : ''}
        <div style="text-align:center;margin:24px 0">
          <a href="${siteUrl}/upcoming-markets" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">Browse Upcoming Events</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Connecting local vendors with event hosts<br>
      Questions? Email us at <a href="mailto:support@southjerseyvendormarket.com" style="color:#a89a8a">support@southjerseyvendormarket.com</a>
    </div>
  </div>
</body></html>`;

  try {
    const { error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [email],
      subject: `Welcome to South Jersey Vendor Market — Your Event Alerts Are Set!`,
      html,
    });
    if (error) { console.error('Guest welcome error:', error); return res.status(500).json({ error: 'Failed' }); }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Guest welcome error:', err);
    return res.status(500).json({ error: 'Failed' });
  }
};
