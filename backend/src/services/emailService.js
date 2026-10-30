const { Resend } = require("resend");

const isConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

const sendEmail = async ({ to, subject, html, text }) => {
  if (!isConfigured()) {
    throw new Error("Email service is not configured.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Email delivery failed:", error.message);
    throw new Error("Email delivery failed.");
  }
};

module.exports = { isConfigured, sendEmail };
