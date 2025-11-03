const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  addRecentlyViewed,
  getRecentlyViewed,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/recently-viewed', protect, addRecentlyViewed);
router.get('/recently-viewed', protect, getRecentlyViewed);

module.exports = router;
