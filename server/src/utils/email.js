import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

const escapeHtml = (s = "") =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    // No SMTP configured: print the message so local development works without an email provider.
    console.log(`\n--- [dev email] ---\nTo: ${to}\nSubject: ${subject}\n${text}\n-------------------\n`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, text, html });
}

const layout = (name, body, link, cta) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#15171C">
    <h2 style="margin:0 0 16px">CampusConnect</h2>
    <p>Hi ${escapeHtml(name)},</p>
    <p>${body}</p>
    <p><a href="${link}" style="display:inline-block;background:#2F3FD4;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${cta}</a></p>
    <p style="font-size:12px;color:#5E6472">If the button doesn't work, paste this link into your browser:<br>${link}</p>
  </div>`;

export function sendVerificationEmail(user, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  return sendMail({
    to: user.email,
    subject: "Verify your CampusConnect email",
    text: `Hi ${user.fullName}, verify your email within 24 hours: ${link}`,
    html: layout(user.fullName, "Confirm your university email to activate your account. This link expires in 24 hours.", link, "Verify email"),
  });
}

export function sendPasswordResetEmail(user, token) {
  const link = `${env.clientUrl}/reset-password?token=${token}`;
  return sendMail({
    to: user.email,
    subject: "Reset your CampusConnect password",
    text: `Hi ${user.fullName}, reset your password within 1 hour: ${link}`,
    html: layout(user.fullName, "We received a request to reset your password. This link expires in 1 hour. If this wasn't you, ignore this email.", link, "Reset password"),
  });
}
