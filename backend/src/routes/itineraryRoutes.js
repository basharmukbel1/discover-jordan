const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { generateItinerary } = require("../controllers/itineraryController");

const router = express.Router();
const itineraryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post("/", itineraryRateLimit, generateItinerary);

module.exports = router;
