import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
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
    console.error("Email sending error:", error.message);
    // Don't throw - allow app to continue even if email fails
    return { error: error.message, messageId: null };
  }
};
