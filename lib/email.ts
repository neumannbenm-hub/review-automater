import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export interface FeedbackEmailOptions {
  to: string;
  customerName: string;
  customerEmail: string;
  message: string;
}

export async function sendFeedbackEmail(opts: FeedbackEmailOptions) {
  const from = process.env.SMTP_FROM ?? "no-reply@reviewboost.app";
  const transport = createTransport();

  if (!transport) {
    console.log("[feedback email] SMTP not configured — logging feedback instead");
    console.log(`  To: ${opts.to}`);
    console.log(`  From customer: ${opts.customerName} <${opts.customerEmail}>`);
    console.log(`  Message: ${opts.message}`);
    return;
  }

  await transport.sendMail({
    from,
    to: opts.to,
    replyTo: opts.customerEmail,
    subject: `New Customer Feedback — ${opts.customerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="color:#4f46e5;margin-bottom:4px;">New Customer Feedback</h2>
        <p style="color:#6b7280;margin-top:0;font-size:14px;">A customer shared feedback before leaving a review.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <table style="font-size:14px;color:#374151;width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-weight:600;width:120px;">Name</td>
            <td style="padding:6px 0;">${opts.customerName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">Email</td>
            <td style="padding:6px 0;">
              <a href="mailto:${opts.customerEmail}" style="color:#4f46e5;">${opts.customerEmail}</a>
            </td>
          </tr>
        </table>
        <div style="margin-top:16px;background:#f9fafb;border-left:3px solid #4f46e5;padding:12px 16px;border-radius:0 6px 6px 0;">
          <p style="margin:0;font-size:14px;color:#374151;white-space:pre-wrap;">${opts.message}</p>
        </div>
        <p style="font-size:13px;color:#9ca3af;margin-top:24px;">
          Reply directly to this email to reach the customer.
        </p>
      </div>
    `,
    text: `New Customer Feedback\n\nName: ${opts.customerName}\nEmail: ${opts.customerEmail}\n\nMessage:\n${opts.message}\n\nReply to this email to contact the customer.`,
  });
}
