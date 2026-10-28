const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

module.exports = router;
