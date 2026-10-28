const express = require("express");
const { getTrips, createTrip, updateTrip, deleteTrip } = require("../controllers/tripController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.get("/", getTrips);
router.post("/", createTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

module.exports = router;
