const express = require("express");
const { getOverview } = require("../controllers/adminController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth, authorize("admin"));
router.get("/overview", getOverview);

module.exports = router;
