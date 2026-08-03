import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, message } = (req.body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !EMAIL_RE.test(email) ||
    typeof message !== "string" || !message.trim()
  ) {
    res.status(400).json({ error: "Please provide a valid name, email, and message." });
    return;
  }

  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    res.status(500).json({ error: "Email isn't configured on the server yet." });
    return;
  }

  const safeName = name.trim().slice(0, 200);
  const safeMessage = message.trim().slice(0, 5000);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  try {
    // Notify the owner — reply-to is the visitor's own address so a direct
    // reply from Gmail goes straight back to them.
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: email,
      subject: `New portfolio message from ${safeName}`,
      text: `From: ${safeName} <${email}>\n\n${safeMessage}`,
    });

    // Confirm receipt to the visitor
    await transporter.sendMail({
      from: `"Vraj Shah" <${GMAIL_USER}>`,
      to: email,
      subject: "Thanks for reaching out — I've got your message",
      text: `Hi ${safeName},\n\nThanks for reaching out through my portfolio — this confirms your message landed with me:\n\n"${safeMessage}"\n\nI'll get back to you soon.\n\n— Vraj`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact form email failed:", err);
    res.status(502).json({ error: "Couldn't send that just now — please email me directly instead." });
  }
}
