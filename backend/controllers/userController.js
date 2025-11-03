const User = require('../models/User');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add recently viewed property
const addRecentlyViewed = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user = await User.findById(req.user._id);

    user.recentlyViewed = user.recentlyViewed.filter(
      (id) => id.toString() !== propertyId
    );

    user.recentlyViewed.unshift(propertyId);

    if (user.recentlyViewed.length > 10) {
      user.recentlyViewed = user.recentlyViewed.slice(0, 10);
    }

    await user.save();
    res.json({ message: 'Added to recently viewed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recently viewed
const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed');
    res.json(user.recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addRecentlyViewed,
  getRecentlyViewed,
};
