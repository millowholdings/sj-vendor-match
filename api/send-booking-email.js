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

  const {
    vendorEmail, vendorName, hostName, hostEmail,
    eventName, eventType, eventDate, startTime, endTime,
    eventZip, address, attendance, vendorCount, budget,
    notes, isRecurring, recurrenceFrequency, recurrenceDay,
    responseToken,
  } = req.body;

  if (!vendorEmail || !responseToken) {
    return res.status(400).json({ error: 'Missing vendorEmail or responseToken' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';
  const respondUrl = `${baseUrl}?respond=${responseToken}`;

  const fmtDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
  };

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const detailRows = [
    eventType && ['Event Type', eventType],
    eventDate && ['Date', fmtDate(eventDate)],
    startTime && ['Time', `${fmtTime(startTime)}${endTime ? ' – ' + fmtTime(endTime) : ''}`],
    address && ['Location', address],
    eventZip && ['Zip Code', eventZip],
    attendance && ['Expected Attendance', attendance],
    vendorCount && ['Vendor Spots', vendorCount],
    budget && ['Budget / Booth Fee', budget],
    notes && ['Notes', notes],
    isRecurring && ['Recurring', `${recurrenceFrequency || 'Yes'}${recurrenceDay ? ' (' + recurrenceDay + ')' : ''}`],
  ].filter(Boolean);

  const detailsHtml = detailRows.map(([label, val]) =>
    `<tr><td style="padding:8px 12px;font-size:13px;color:#a89a8a;font-weight:600;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 12px;font-size:14px;color:#1a1410">${val}</td></tr>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410;letter-spacing:-0.5px">South Jersey Vendor Market</div>
      <div style="font-size:13px;color:#a89a8a;margin-top:4px">New Booking Request</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:16px;color:#e8c97a;font-weight:700;margin-bottom:4px">You've received a booking request!</div>
        <div style="font-size:13px;color:#a89a8a">from ${hostName || 'a host'}${hostEmail ? ' (' + hostEmail + ')' : ''}</div>
      </div>
      <div style="padding:24px 28px">
        <div style="font-size:18px;font-weight:700;color:#1a1410;margin-bottom:4px">${eventName || eventType || 'Event'}</div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${detailsHtml}
        </table>
        <div style="text-align:center;margin:28px 0 8px">
          <a href="${respondUrl}" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.3px">
            View & Respond to Request
          </a>
        </div>
        <div style="text-align:center;font-size:12px;color:#a89a8a;margin-top:12px">
          Click the button above to accept or decline this booking request.
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market · Connecting local vendors with event hosts<br>
      This email was sent because a host requested to book your services.
    </div>
  </div>
</body>
</html>`;

  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'bookings@sjvendormarket.com';

  try {
    const { data, error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [vendorEmail],
      subject: `Booking Request: ${eventName || eventType || 'New Event'} — ${fmtDate(eventDate) || 'Date TBD'}`,
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
