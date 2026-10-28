const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "Jordan",
    },
    category: {
      type: String,
      enum: [
        "Historical",
        "Nature",
        "Adventure",
        "Cultural",
        "Relaxation",
        "Hiking",
        "Reserve",
        "Museum",
      ],
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imageCredit: {
      type: String,
      default: "",
    },
    gallery: [String],
    duration: {
      type: String,
      default: "1 day",
    },
    bestFor: [String],
    highlights: [String],
    price: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.6,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", destinationSchema);
