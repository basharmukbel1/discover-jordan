const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { chatWithAssistant } = require("../controllers/assistantController");
const auth = require("../middleware/auth");

const router = express.Router();
const assistantRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post("/chat", auth, assistantRateLimit, chatWithAssistant);

module.exports = router;
