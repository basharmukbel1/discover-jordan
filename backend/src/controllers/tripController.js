const Trip = require("../models/Trip");

const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).populate("destinations").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      trips,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createTrip = async (req, res) => {
  try {
    const { title, destinations, startDate, endDate, notes } = req.body;

    if (!title || !destinations || !destinations.length || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide trip title, destinations, start date, and end date.",
      });
    }

    const trip = await Trip.create({
      user: req.user._id,
      title,
      destinations,
      startDate,
      endDate,
      notes,
    });

    const createdTrip = await Trip.findById(trip._id).populate("destinations");

    return res.status(201).json({
      success: true,
      trip: createdTrip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate("destinations");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    return res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
};
