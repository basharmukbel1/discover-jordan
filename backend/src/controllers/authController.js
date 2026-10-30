const { createHash, randomBytes } = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isConfigured, sendEmail } = require("../services/emailService");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const createToken = () => randomBytes(32).toString("hex");
const frontendUrl = () =>
  process.env.FRONTEND_URL ||
  process.env.CORS_ORIGIN?.split(",")[0]?.trim() ||
  "http://localhost:5173";

const sendVerificationEmail = (user, token) => {
  const link = new URL("/verify-email", frontendUrl());
  link.searchParams.set("token", token);
  return sendEmail({
    to: user.email,
    subject: "Verify your Discover Jordan account",
    text: `Verify your email address: ${link.toString()}`,
    html: `<p>Welcome to Discover Jordan.</p><p><a href="${link.toString()}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide a name, valid email, and password with at least 6 characters.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email.",
      });
    }

    const token = createToken();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      emailVerified: false,
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    try {
      await sendVerificationEmail(user, token);
    } catch (error) {
      console.error("Verification email could not be sent:", error.message);
      return res.status(503).json({
        success: false,
        message: "Your account was created, but its verification email could not be sent. Try resending it later.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Check your email to verify it before signing in.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email.",
      });
    }
    console.error("Registration failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not create your account." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string" || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password.",
    });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Verify your email before signing in.",
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not sign in." });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body || {};
  if (typeof token !== "string" || !token) {
    return res.status(400).json({ success: false, message: "A verification token is required." });
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This verification link is invalid or has expired. Request a new one and try again.",
      });
    }

    user.emailVerified = true;
    await user.save();
    return res.status(200).json({ success: true, message: "Email verified. You can now sign in." });
  } catch (error) {
    console.error("Email verification failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not verify your email." });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body || {};
  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ success: false, message: "Please provide your email address." });
  }
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: "Email delivery is not configured yet." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user && !user.emailVerified) {
      const token = createToken();
      user.emailVerificationToken = hashToken(token);
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();
      await sendVerificationEmail(user, token);
    }
    return res.status(200).json({
      success: true,
      message: "If that account needs verification, a new link has been sent.",
    });
  } catch (error) {
    console.error("Resending verification email failed:", error.message);
    return res.status(503).json({ success: false, message: "Could not send the verification email. Try again later." });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ success: false, message: "Please provide your email address." });
  }
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: "Email delivery is not configured yet." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      const token = createToken();
      const link = new URL("/reset-password", frontendUrl());
      link.searchParams.set("token", token);
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
      await user.save();
      await sendEmail({
        to: user.email,
        subject: "Reset your Discover Jordan password",
        text: `Reset your password: ${link.toString()}`,
        html: `<p>Use this link to reset your Discover Jordan password:</p><p><a href="${link.toString()}">Reset password</a></p><p>This link expires in one hour. If you did not request it, you can ignore this email.</p>`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset email failed:", error.message);
    return res.status(503).json({ success: false, message: "Could not send a password reset email. Try again later." });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== "string" || !token || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid reset link and a password with at least 6 characters.",
    });
  }

  try {
    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "This password reset link is invalid or has expired." });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Password updated. You can now sign in." });
  } catch (error) {
    console.error("Password reset failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not reset your password." });
  }
};

const googleLogin = async (req, res) => {
  const { credential } = req.body || {};
  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({ success: false, message: "A Google credential is required." });
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ success: false, message: "Google sign-in is not configured yet." });
  }

  let payload;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("Google credential verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Google sign-in could not be verified. Try again." });
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    return res.status(401).json({ success: false, message: "Google did not provide a verified email address." });
  }

  try {
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
    }).select("+password");

    if (user?.googleId && user.googleId !== payload.sub) {
      return res.status(409).json({
        success: false,
        message: "This email is already linked to a different Google account.",
      });
    }

    if (!user) {
      user = new User({
        name: payload.name || payload.email,
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        emailVerified: true,
      });
    } else {
      user.googleId = payload.sub;
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
    }

    await user.save();
    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    console.error("Google sign-in failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not complete Google sign-in." });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Loading current user failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not load your account." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin,
  getCurrentUser,
};
