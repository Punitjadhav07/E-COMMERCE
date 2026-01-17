// backend/routes/auth.routes.js
import express from "express";
import {
  createUser,
  findUserByEmail,
  generateAndStoreOTP,
  verifyOTP,
  activateUserAndClearOTP,
  clearOTP,
  getOTPExpiry,
  deleteUnverifiedUserAfterExpiry,
} from "../models/user.model.js";
import { sendOTPEmail } from "../services/email.service.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password, role required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Create user (verified=0, status='pending')
    const userId = await createUser({ email, password, role });

    // Generate and store OTP
    let otp;
    try {
      otp = await generateAndStoreOTP(email);
    } catch (otpError) {
      console.error("Failed to generate/store OTP:", otpError);
      // If OTP columns don't exist, this will fail
      // Return error with helpful message
      throw new Error(`Database error: ${otpError.message}. Make sure 'otp_code' and 'otp_expires_at' columns exist in users table.`);
    }

    // Send OTP email automatically
    try {
      const emailResult = await sendOTPEmail(email, otp);
      console.log(`✅ OTP email sent successfully to ${email}`, emailResult);
    } catch (emailError) {
      console.error("❌ Failed to send OTP email:", emailError.message);
      console.error("Full error:", emailError);
      // User is created, but email failed - still return success
      // Frontend can handle resending OTP
    }

    res.status(201).json({ 
      message: "Registered successfully. OTP sent to your email.", 
      userId, 
      role,
      email 
    });
  } catch (err) {
    console.error("Register error:", err);
    // Send more detailed error for debugging
    res.status(500).json({ 
      error: "Register failed",
      message: err.message || "Unknown error",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    if (user.verified === 1) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Check if user should be deleted (expired and unverified)
    const wasDeleted = await deleteUnverifiedUserAfterExpiry(email);
    if (wasDeleted) {
      return res.status(410).json({ error: "Previous OTP expired. User account was deleted. Please register again." });
    }

    // Generate and store new OTP
    const otp = await generateAndStoreOTP(email);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      res.json({ message: "OTP sent to your email" });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      res.status(500).json({ error: "Failed to send OTP email" });
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ 
      error: "Failed to send OTP",
      message: err.message || "Unknown error",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// GET /api/auth/otp-expiry - Get OTP expiry time for frontend timer
router.get("/otp-expiry", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists and is verified
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verified === 1) {
      return res.json({ verified: true, message: "User already verified" });
    }

    // Check if user should be deleted (expired and unverified)
    const wasDeleted = await deleteUnverifiedUserAfterExpiry(email);
    if (wasDeleted) {
      return res.status(410).json({ error: "OTP expired. User account deleted. Please register again." });
    }

    // Get OTP expiry time
    const expiresAt = await getOTPExpiry(email);

    if (!expiresAt) {
      return res.status(400).json({ error: "No OTP found. Please request a new OTP." });
    }

    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const timeLeft = Math.max(0, Math.floor((expiryDate - now) / 1000)); // seconds

    if (timeLeft <= 0) {
      // OTP expired, delete user
      await deleteUnverifiedUserAfterExpiry(email);
      return res.status(410).json({ error: "OTP expired. User account deleted. Please register again." });
    }

    res.json({ expiresAt: expiresAt, timeLeft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get OTP expiry" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user should be deleted (expired and unverified)
    const wasDeleted = await deleteUnverifiedUserAfterExpiry(email);
    if (wasDeleted) {
      return res.status(410).json({ error: "OTP expired. User account deleted. Please register again." });
    }

    // Verify OTP (wrong OTP will return invalid, won't verify user)
    const verification = await verifyOTP(email, otp);

    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }

    // Activate user (set verified=1, status='active', clear OTP)
    await activateUserAndClearOTP(email);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is verified
    if (user.verified === 0 || user.verified === null) {
      return res.status(403).json({ 
        error: "Email not verified. Please verify your email first.",
        verified: false 
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
