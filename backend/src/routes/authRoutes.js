const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin,
  getCurrentUser,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);
router.post("/google", authRateLimit, googleLogin);
router.post("/verify-email", authRateLimit, verifyEmail);
router.post("/resend-verification", authRateLimit, resendVerification);
router.post("/forgot-password", authRateLimit, forgotPassword);
router.post("/reset-password", authRateLimit, resetPassword);
router.get("/me", auth, getCurrentUser);

module.exports = router;
