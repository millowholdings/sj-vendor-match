const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { name, email, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Save to Supabase
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('contact_submissions').insert({
        name: name || null,
        email,
        subject: subject || null,
        message,
      });
    } catch (e) { console.error('Failed to save contact to DB:', e); }
  }

  const resend = new Resend(resendKey);
  const fromAddr = process.env.RESEND_FROM_EMAIL || 'hello@southjerseyvendormarket.com';
  const adminEmail = 'tiffany@southjerseyvendormarket.com';

  try {
    const { error } = await resend.emails.send({
      from: `South Jersey Vendor Market <${fromAddr}>`,
      to: [adminEmail],
      reply_to: email,
      subject: `[Contact Form] ${subject || 'New message'} — from ${name || email}`,
      html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
  <h2 style="color:#1a1410">New Contact Form Submission</h2>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px;color:#7a6a5a;font-weight:bold;width:80px">Name:</td><td style="padding:8px">${name || '—'}</td></tr>
    <tr><td style="padding:8px;color:#7a6a5a;font-weight:bold">Email:</td><td style="padding:8px">${email}</td></tr>
    <tr><td style="padding:8px;color:#7a6a5a;font-weight:bold">Subject:</td><td style="padding:8px">${subject || '—'}</td></tr>
  </table>
  <div style="margin-top:16px;padding:16px;background:#f5f0ea;border-radius:8px;white-space:pre-wrap">${message}</div>
  <div style="margin-top:16px;font-size:12px;color:#a89a8a">Reply directly to this email to respond to ${name || 'the submitter'}.</div>
</div>`,
    });
    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Failed to send' });
  }
};
