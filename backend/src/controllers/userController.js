const User = require("../models/User");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid name is required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
