import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Support } from '../../../lib/models';

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
    await connectDB();
    const { name, email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supportId = generateSupportId();
    
    // Save to Database
    await Support.create({
      supportId,
      name,
      email,
      subject,
      message,
      status: 'open'
    });

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
        from: `"The Tiny Living Market" <${supportEmail}>`,
        to: email,
        subject: `We received your query — Support ID #${supportId}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6;">
            <p>Hi ${name || 'user'},</p>
            <p>We have received your query <strong>“ ${subject} & ${message} ”</strong></p>
            <p style="font-size:18px;font-weight:bold;color:#2D6A4F;">your support ID: #${supportId}</p>
            <br />
            <p>Regard,<br><strong>Support</strong></p>
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
