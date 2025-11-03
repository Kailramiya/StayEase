const Favorite = require('../models/Favorite');

// Add to favorites
const addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const existing = await Favorite.findOne({ user: req.user._id, property: propertyId });
    if (existing) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    const favorite = new Favorite({ user: req.user._id, property: propertyId });
    await favorite.save();

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOneAndDelete({ user: req.user._id, property: propertyId });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate('property');
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if a property is favorited by the logged-in user
const checkFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const fav = await Favorite.findOne({ user: req.user._id, property: propertyId });
    res.json({ isFavorite: Boolean(fav) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
};
