const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Email service not configured' });

  const { to, name, type, entityName, approved, reason } = req.body;
  // type: 'vendor' or 'event'
  // approved: true or false
  if (!to) return res.status(400).json({ error: 'Missing email' });

  const resend = new Resend(resendKey);
  const fromAddr = 'hello@southjerseyvendormarket.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://southjerseyvendormarket.com';

  const isVendor = type === 'vendor';
  const label = isVendor ? 'Vendor Application' : 'Event Listing';
  const entityLabel = entityName || (isVendor ? 'your business' : 'your event');

  const subject = approved
    ? `${approved ? 'Approved' : 'Update'}: ${entityLabel} is now live!`
    : `${label} Update: ${entityLabel}`;

  const bodyHtml = approved ? `
    <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">Hi ${escapeHtml(name) || 'there'},</p>
    <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
      Great news! <strong>${escapeHtml(entityLabel)}</strong> has been approved and is now live on South Jersey Vendor Market.
    </p>
    <div style="background:#d4f4e0;border:1px solid #b8e8c8;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
      <div style="font-size:16px;color:#1a6b3a;font-weight:700">✓ You're Live!</div>
      <div style="font-size:13px;color:#2d7a50;margin-top:4px">${isVendor ? 'Hosts can now find and book you for events.' : 'Vendors can now discover and apply to your event.'}</div>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="${siteUrl}/${isVendor ? 'vendor-dashboard' : 'host-dashboard'}" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">
        Go to Your Dashboard
      </a>
    </div>
  ` : `
    <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">Hi ${escapeHtml(name) || 'there'},</p>
    <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
      Thank you for submitting <strong>${escapeHtml(entityLabel)}</strong> to South Jersey Vendor Market. After review, we were unable to approve it at this time.
    </p>
    ${reason ? `
    <div style="background:#fdecea;border:1px solid #f5c6c6;border-radius:8px;padding:16px;margin:20px 0">
      <div style="font-size:12px;color:#8b1a1a;font-weight:700;margin-bottom:6px">REASON</div>
      <div style="font-size:14px;color:#1a1410;line-height:1.5">${escapeHtml(reason)}</div>
    </div>` : ''}
    <p style="font-size:14px;color:#1a1410;line-height:1.6;margin-bottom:16px">
      If you'd like to resubmit with updated information, you're welcome to try again.
    </p>
    <div style="text-align:center;margin:24px 0">
      <a href="${siteUrl}/${isVendor ? 'vendor' : 'host'}" style="display:inline-block;background:#c8a84b;color:#1a1410;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px">
        ${isVendor ? 'Resubmit Application' : 'Resubmit Event'}
      </a>
    </div>
  `;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:24px;font-weight:700;color:#1a1410">South Jersey Vendor Market</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden">
      <div style="background:#1a1410;padding:24px 28px;text-align:center">
        <div style="font-size:18px;color:#e8c97a;font-weight:700">${approved ? 'Application Approved!' : 'Application Update'}</div>
      </div>
      <div style="padding:24px 28px">${bodyHtml}</div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#a89a8a;line-height:1.6">
      South Jersey Vendor Market &middot; Connecting local vendors with event hosts<br>
      Questions? Reply to this email or contact support@southjerseyvendormarket.com
    </div>
  </div>
</body></html>`;

  // Log to database
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try { const sb = createClient(supabaseUrl, supabaseKey); await sb.from('email_log').insert({ to_email:to, subject, email_type: `${type}_${approved?'approved':'rejected'}` }); } catch(e) { console.error('Email log error:', e); }
  }

  try {
    const { error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [to],
      subject,
      html,
    });
    if (error) { console.error('Approval email error:', error); return res.status(500).json({ error: 'Failed to send' }); }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Approval email error:', err);
    return res.status(500).json({ error: 'Failed to send' });
  }
};
