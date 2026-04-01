const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Email service not configured' });

  const { hostEmail, hostName, eventName, eventDate, eventType, isConcierge } = req.body;
  if (!hostEmail) return res.status(400).json({ error: 'Missing hostEmail' });

  const resend = new Resend(resendKey);
  const fromAddr = 'hello@southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  const fmtDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
  };

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">Event Submitted!</div>
      </div>
      <div style="padding:24px 28px">
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">Hi ${hostName || 'there'},</p>
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Thank you for submitting <strong>${eventName || eventType || 'your event'}</strong>${eventDate ? ' on ' + fmtDate(eventDate) : ''} to South Jersey Vendor Market.
        </p>
        <div style="background:#fdf4dc;border:1px solid #ffd966;border-radius:8px;padding:16px;margin:20px 0">
          <div style="font-size:14px;color:#7a5a10;font-weight:700;margin-bottom:6px">Pending Review</div>
          <div style="font-size:13px;color:#7a5a10;line-height:1.5">Your event is now being reviewed by our team. You'll receive an email once it's approved and live on the platform. This typically takes less than 24 hours.</div>
        </div>
        ${isConcierge ? `
        <div style="background:#1a1410;border-radius:8px;padding:16px;margin:20px 0">
          <div style="font-size:14px;color:#e8c97a;font-weight:700;margin-bottom:4px">Concierge Request Received</div>
          <div style="font-size:13px;color:#a89a8a;line-height:1.5">Our team will reach out within 24 hours to schedule a free consultation and discuss vendor coordination for your event.</div>
        </div>` : ''}
        <div style="background:#fdf9f5;border:1px solid #e8ddd0;border-radius:8px;padding:16px;margin:20px 0">
          <div style="font-size:13px;color:#1a1410;font-weight:700;margin-bottom:6px">What happens next?</div>
          <div style="font-size:13px;color:#7a6a5a;line-height:1.6">
            1. Our team reviews your event details<br>
            2. Once approved, your event goes live<br>
            3. Vendors in your area get notified<br>
            4. You'll receive applications and booking requests
          </div>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${siteUrl}/host-dashboard" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">View Your Dashboard</a>
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
      to: [hostEmail],
      subject: `Event Submitted: ${eventName || eventType || 'Your Event'} — Under Review`,
      html,
    });
    if (error) { console.error('Host confirmation error:', error); return res.status(500).json({ error: 'Failed' }); }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Host confirmation error:', err);
    return res.status(500).json({ error: 'Failed' });
  }
};
