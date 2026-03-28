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

  const { hostEmail, hostName, eventName, eventDate, eventId } = req.body;
  if (!hostEmail) {
    return res.status(400).json({ error: 'Missing hostEmail' });
  }

  const fmtDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410;letter-spacing:-0.5px">South Jersey Vendor Market</div>
      <div style="font-size:13px;color:#a89a8a;margin-top:4px">Full Service Concierge</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:16px;color:#e8c97a;font-weight:700;margin-bottom:4px">Concierge Request Received</div>
        <div style="font-size:13px;color:#a89a8a">Thank you for choosing our full-service option!</div>
      </div>
      <div style="padding:24px 28px">
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Hi ${hostName || 'there'},
        </p>
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          You requested Full Service Concierge for <strong>${eventName || 'your event'}</strong>${eventDate ? ' on ' + fmtDate(eventDate) : ''}.
          Our team will find and book vendors, handle confirmations and follow-ups, and provide a day-of coordination checklist.
        </p>
        <div style="background:#fdf9f5;border:1px solid #e8ddd0;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
          <div style="font-size:14px;color:#1a1410;font-weight:600">What happens next?</div>
          <div style="font-size:13px;color:#7a6a5a;margin-top:6px;line-height:1.5">
            A member of our team will reach out within 24 hours to schedule a free consultation. We'll discuss your event details, vendor needs, and customize a concierge plan with pricing tailored to your event.
          </div>
        </div>
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:20px">
          In the meantime, your event has been submitted for review and you can track its status from your Host Dashboard.
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Connecting local vendors with event hosts<br>
      Questions? Reply to this email or contact support@southjerseyvendormarket.com
    </div>
  </div>
</body>
</html>`;

  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'hello@send.southjerseyvendormarket.com';

  try {
    const { data, error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [hostEmail],
      subject: `Concierge Request: ${eventName || 'Your Event'} — We'll Be in Touch Within 24 Hours`,
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
