import { NextRequest, NextResponse } from 'next/server';

function generateSupportId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendMail(opts: {
  smtpUser: string;
  smtpPass: string;
  smtpHost: string;
  smtpPort: number;
  to: string;
  from: string;
  subject: string;
  html: string;
}) {
  // Dynamic require so TypeScript doesn't error — nodemailer is a common dep
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require('nodemailer') as typeof import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: opts.smtpHost,
    port: opts.smtpPort,
    secure: false,
    auth: { user: opts.smtpUser, pass: opts.smtpPass },
  });
  return transporter.sendMail({ from: opts.from, to: opts.to, subject: opts.subject, html: opts.html });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supportId = generateSupportId();
    const supportEmail = 'support@tinylivingmarket.com';

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    if (smtpHost && smtpUser && smtpPass) {
      const baseOpts = { smtpHost, smtpUser, smtpPass, smtpPort };

      // 1. Notify support team
      await sendMail({
        ...baseOpts,
        from: `"TinyNest Support System" <${smtpUser}>`,
        to: supportEmail,
        subject: `[Support #${supportId}] ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#2D6A4F">New Support Inquiry — #${supportId}</h2>
            <p><strong>From:</strong> ${name || 'Unknown'} &lt;${email}&gt;</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-top:16px">
              <p style="margin:0;white-space:pre-wrap">${message}</p>
            </div>
            <p style="margin-top:20px;font-size:12px;color:#666">Support ID: ${supportId} | Submitted: ${new Date().toLocaleString()}</p>
          </div>
        `,
      });

      // 2. Auto-reply to user
      await sendMail({
        ...baseOpts,
        from: `"Team Tiny Living Market" <${smtpUser}>`,
        to: email,
        subject: `We received your query — Support ID #${supportId}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2D6A4F;color:white;padding:24px 32px;border-radius:12px 12px 0 0">
              <h2 style="margin:0;font-size:22px">Tiny Living Market</h2>
              <p style="margin:8px 0 0;opacity:.8;font-size:14px">Support Confirmation</p>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:32px">
              <p>Hi ${name || 'there'},</p>
              <p>We have received your query:</p>
              <div style="background:#f0fdf4;border-left:4px solid #2D6A4F;padding:16px;margin:16px 0;border-radius:0 8px 8px 0">
                <p style="margin:0;font-weight:bold;color:#1f2937">${subject}</p>
                <p style="margin:8px 0 0;color:#374151;white-space:pre-wrap">${message}</p>
              </div>
              <p style="font-size:18px;font-weight:bold">Your Support ID: <span style="color:#2D6A4F">#${supportId}</span></p>
              <p>Our team will get back to you within 24–48 business hours.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
              <p style="margin:0;color:#6b7280;font-size:13px">Regards,<br><strong>Team Tiny Living Market</strong><br>${supportEmail}</p>
            </div>
          </div>
        `,
      });
    } else {
      console.log(`[Support] New inquiry #${supportId} from ${email} — set SMTP_HOST/USER/PASS env vars to enable emails.`);
    }

    return NextResponse.json({
      success: true,
      supportId,
      message: 'Your inquiry has been received.',
    });
  } catch (err) {
    console.error('Support API error:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
