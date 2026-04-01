const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
function logEmail(to, subject, type) { const u=process.env.REACT_APP_SUPABASE_URL||process.env.SUPABASE_URL, k=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.REACT_APP_SUPABASE_ANON_KEY; if(u&&k) createClient(u,k).from('email_log').insert({to_email:to,subject,email_type:type}).then(()=>{}).catch(()=>{}); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { businessName, contactName, vendorEmail, category, vendorType, phone } = req.body;
  if (!businessName || !vendorEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(resendKey);
  const fromAddr = 'hello@southjerseyvendormarket.com';
  const adminEmail = 'tiffany@southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sj-vendor-match.vercel.app';

  const typeLabel = vendorType === 'both' ? 'Market Vendor + Service Provider'
    : vendorType === 'service' ? 'Event Service Provider' : 'Market Vendor';

  // 1. Email to admin
  try {
    await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [adminEmail],
      subject: `New Vendor Application: ${businessName}`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
      <div style="font-size:13px;color:#a89a8a;margin-top:4px">New Vendor Application</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">New Vendor Pending Review</div>
      </div>
      <div style="padding:24px 28px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600;width:120px">Business Name</td><td style="padding:8px 0;font-size:14px;color:#1a1410;font-weight:700">${businessName}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Contact</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${contactName || '—'}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Email</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${vendorEmail}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Phone</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${phone || '—'}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Category</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${category || '—'}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#a89a8a;font-weight:600">Vendor Type</td><td style="padding:8px 0;font-size:14px;color:#1a1410">${typeLabel}</td></tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="${siteUrl}/admin" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">Review in Admin Panel</a>
        </div>
      </div>
    </div>
  </div>
</body></html>`,
    });
    logEmail(adminEmail, `New Vendor Application: ${businessName}`, 'vendor_admin_notification');
  } catch (e) { console.error('Admin notification error:', e); }

  // 2. Confirmation email to vendor
  try {
    await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [vendorEmail],
      subject: `Application Received: ${businessName} — South Jersey Vendor Market`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">Application Received!</div>
      </div>
      <div style="padding:24px 28px">
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Hi ${contactName || 'there'},
        </p>
        <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
          Thank you for applying to join <strong>South Jersey Vendor Market</strong>! We've received your application for <strong>${businessName}</strong> and our team will review it within <strong>24 hours</strong>.
        </p>
        <div style="background:#fdf9f5;border:1px solid #e8ddd0;border-radius:8px;padding:16px;margin:20px 0">
          <div style="font-size:13px;color:#1a1410;font-weight:700;margin-bottom:8px">What happens next?</div>
          <div style="font-size:13px;color:#7a6a5a;line-height:1.6">
            1. Our team reviews your application<br>
            2. Once approved, your profile goes live in the vendor directory<br>
            3. You'll start getting matched with events in your area<br>
            4. Hosts can find you and send booking requests
          </div>
        </div>
        <p style="font-size:14px;color:#1a1410;line-height:1.6">
          In the meantime, you can log in to your <a href="${siteUrl}/vendor-dashboard" style="color:#c8a84b;font-weight:600">Vendor Dashboard</a> to check your application status.
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Connecting local vendors with event hosts<br>
      Questions? Reply to this email or contact support@southjerseyvendormarket.com
    </div>
  </div>
</body></html>`,
    });
    logEmail(vendorEmail, `Application Received: ${businessName}`, 'vendor_confirmation');
  } catch (e) { console.error('Vendor confirmation error:', e); }

  return res.status(200).json({ success: true });
};
