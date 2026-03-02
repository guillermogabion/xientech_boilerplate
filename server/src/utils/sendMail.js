const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Validation: Ensure variables exist
  if (!process.env.SMTP_USER || !process.env.EMAIL_APP_KEY) {
    throw new Error("Email credentials missing in .env file");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.EMAIL_APP_KEY,
    },
  });

  // Extract the URL from options
  const { resetUrl, email, subject } = options;

  const mailOptions = {
    from: '"XIENTECH Support" <noreply@xientech.com>',
    to: email,
    subject: subject || "Reset Your XIENTECH Password",
    // Use 'html' instead of 'text' for the template
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">XIENTECH</h1>
      </div>
      <div style="padding: 30px; color: #333333; line-height: 1.6;">
        <h2 style="color: #1f2937;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your XIENTECH account. Click the button below to choose a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">
          This link will expire in <strong>1 hour</strong> for your security. If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          If you're having trouble clicking the button, copy and paste the URL below into your web browser: <br />
          <span style="color: #2563eb; word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        &copy; 2026 XIENTECH - SMART Community. All rights reserved.
      </div>
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("HTML Email sent successfully to:", email);
  } catch (error) {
    console.error("Nodemailer Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;