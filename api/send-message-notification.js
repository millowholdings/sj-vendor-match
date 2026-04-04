const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

// Track recent notifications to prevent spam (in-memory, resets on cold start)
const recentNotifications = {};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Email service not configured' });

  const { recipientEmail, recipientName, senderName, senderType, eventName, messagePreview, recipientType } = req.body;
  if (!recipientEmail) return res.status(400).json({ error: 'Missing recipientEmail' });

  // 5-minute debounce per recipient — only send one email per 5 minutes
  const now = Date.now();
  const key = recipientEmail.toLowerCase();
  if (recentNotifications[key] && (now - recentNotifications[key]) < 5 * 60 * 1000) {
    return res.status(200).json({ skipped: true, reason: 'Rate limited — notification sent within last 5 minutes' });
  }
  recentNotifications[key] = now;

  // Clean up old entries every 100 calls
  if (Object.keys(recentNotifications).length > 100) {
    for (const k of Object.keys(recentNotifications)) {
      if (now - recentNotifications[k] > 10 * 60 * 1000) delete recentNotifications[k];
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://southjerseyvendormarket.com';
  const resend = new Resend(resendKey);
  const fromAddr = 'hello@southjerseyvendormarket.com';
  const roleLabel = senderType === 'vendor' ? 'vendor' : 'host';

  try {
    const { error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [recipientEmail],
      subject: `New message from ${senderName || ('a ' + roleLabel)}${eventName ? ' — ' + eventName : ''}`,
      html: `
<div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff">
  <div style="background:#1a1410;padding:24px 32px;border-radius:12px 12px 0 0">
    <div style="font-family:Georgia,serif;font-size:22px;color:#e8c97a;margin-bottom:4px">New Message</div>
    <div style="font-size:14px;color:#a89a8a">South Jersey Vendor Market</div>
  </div>
  <div style="padding:28px 32px;border:1px solid #e8ddd0;border-top:none;border-radius:0 0 12px 12px">
    <p style="font-size:15px;color:#1a1410;margin:0 0 16px;line-height:1.6">
      Hi ${recipientName || 'there'},
    </p>
    <p style="font-size:15px;color:#1a1410;margin:0 0 16px;line-height:1.6">
      You have a new message from <strong>${senderName || ('a ' + roleLabel)}</strong>.
    </p>
    ${eventName ? `
    <div style="background:#1a1410;border-radius:8px;padding:12px 16px;margin:0 0 16px">
      <div style="font-size:11px;color:#a89a8a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Regarding Event</div>
      <div style="font-size:16px;font-weight:700;color:#e8c97a">${eventName}</div>
    </div>` : ''}
    ${messagePreview ? `
    <div style="background:#fdf9f5;border-left:3px solid #e8c97a;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 20px;font-size:14px;color:#4a3a28;line-height:1.5">
      "${messagePreview.length > 200 ? messagePreview.slice(0, 200) + '...' : messagePreview}"
    </div>` : ''}
    <a href="${siteUrl}/${recipientType === 'vendor' ? 'vendor-dashboard' : 'host-dashboard'}" style="display:inline-block;background:#c8a84b;color:#1a1410;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px">
      Log In to Your Dashboard
    </a>
    <p style="font-size:12px;color:#a89a8a;margin:20px 0 0;line-height:1.5">
      Log in to review and reply to this message. This conversation is protected under the South Jersey Vendor Market Non-Circumvention Agreement.
      Contact info is shared only after an accepted booking on a posted event.
    </p>
  </div>
</div>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    // Log to email_log if table exists
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('email_log').insert({ to: recipientEmail, subject: `New message from ${senderName}`, type: 'message_notification' });
      }
    } catch (e) { /* email_log table may not exist */ }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Send message notification error:', err);
    return res.status(500).json({ error: 'Email send failed' });
  }
};
