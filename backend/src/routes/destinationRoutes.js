const express = require("express");
const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  toggleFavorite,
} = require("../controllers/destinationController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.post("/favorite/:id", auth, toggleFavorite);
router.post("/", auth, authorize("admin"), createDestination);
router.put("/:id", auth, authorize("admin"), updateDestination);
router.delete("/:id", auth, authorize("admin"), deleteDestination);

module.exports = router;
