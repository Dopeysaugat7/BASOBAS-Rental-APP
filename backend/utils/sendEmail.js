import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
  // Debug logging to check environment variables
  console.log("SMTP Host:", process.env.SMTP_HOST);
  console.log("SMTP Mail exists:", !!process.env.SMTP_MAIL);
  console.log("SMTP Password exists:", !!process.env.SMTP_PASSWORD);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: parseInt(process.env.SMTP_PORT), // Ensure port is a number
    secure: process.env.SMTP_PORT === "465", // Only set true if using port 465
    auth: {
      user: process.env.SMTP_MAIL, // This should match your Gmail address
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: subject,
    html: message,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};
