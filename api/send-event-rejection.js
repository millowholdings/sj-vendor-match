const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { hostEmail, hostName, eventName, reason } = req.body;
  if (!hostEmail || !reason) {
    return res.status(400).json({ error: 'Missing hostEmail or reason' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410;letter-spacing:-0.5px">South Jersey Vendor Market</div>
      <div style="font-size:13px;color:#a89a8a;margin-top:4px">Event Review Update</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:16px;color:#e8c97a;font-weight:700;margin-bottom:4px">Event Not Approved</div>
        <div style="font-size:13px;color:#a89a8a">${eventName || 'Your Event'}</div>
      </div>
      <div style="padding:24px 28px">
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Hi ${hostName || 'there'},
        </p>
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Thank you for submitting your event to South Jersey Vendor Market. After review, we were unable to approve
          <strong>${eventName || 'your event'}</strong> at this time.
        </p>
        <div style="background:#fdecea;border:1px solid #f5c6c6;border-radius:8px;padding:16px;margin:20px 0">
          <div style="font-size:12px;color:#8b1a1a;font-weight:700;margin-bottom:6px">REASON</div>
          <div style="font-size:14px;color:#1a1410;line-height:1.5">${reason}</div>
        </div>
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:20px">
          If you believe this was a mistake, or if you'd like to resubmit with updated information, please visit our site and post a new event.
        </p>
        <div style="text-align:center;margin:28px 0 8px">
          <a href="${baseUrl}?tab=host" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.3px">
            Resubmit Event
          </a>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market · Connecting local vendors with event hosts<br>
      Questions? Reply to this email or contact support@sjvendormarket.com
    </div>
  </div>
</body>
</html>`;

  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'bookings@sjvendormarket.com';

  try {
    const { data, error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [hostEmail],
      subject: `Event Review: ${eventName || 'Your Event'} — Not Approved`,
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
    return res.status(200).json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
};
