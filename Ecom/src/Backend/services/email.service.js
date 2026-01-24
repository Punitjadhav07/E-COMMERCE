// backend/services/email.service.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Check if email credentials are configured
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASS not set in .env file!");
}

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password for Gmail
  },
});

/**
 * Send OTP email to user
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    // Verify transporter before sending
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not configured in .env file");
    }

    console.log(`📧 Attempting to send OTP to: ${email}`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Email Verification</h2>
          <p>Thank you for registering! Please verify your email address using the OTP code below:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6b7280;">This OTP will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    const errorMsg = error.message || "Unknown error";
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error("Nodemailer module not found. Please run: npm install nodemailer");
    }
    if (error.code === "EAUTH") {
      throw new Error("Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env");
    }
    throw new Error(`Failed to send OTP email: ${errorMsg}`);
  }
};

/**
 * Send Approval Email
 */
export const sendApprovalEmail = async (email) => {
  try {
    if (!process.env.EMAIL_USER) return;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Your Seller Account Has Been Approved! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">Application Approved</h2>
          <p>Congratulations! Your request to become a seller has been approved by the admin.</p>
          <p>You can now log in to your dashboard and start listing your products.</p>
          <a href="http://localhost:5173/login" style="display: inline-block; background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Dashboard</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${email}`);
  } catch (error) {
    console.error("Error sending approval email:", error);
    // Don't throw, just log
  }
};

/**
 * Send Rejection Email
 */
export const sendRejectionEmail = async (email) => {
  try {
    if (!process.env.EMAIL_USER) return;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Update on Your Seller Application",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Application Rejected</h2>
          <p>We regret to inform you that your request to become a seller has been declined at this time.</p>
          <p>If you believe this is a mistake, please contact support.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${email}`);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};

/**
 * Verify transporter configuration
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};
