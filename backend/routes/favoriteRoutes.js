const express = require('express');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addToFavorites);
router.get('/', protect, getFavorites);
router.get('/check/:propertyId', protect, checkFavorite);
router.delete('/:propertyId', protect, removeFromFavorites);

module.exports = router;
