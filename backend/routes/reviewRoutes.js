const express = require('express');
const {
  createReview,
  getReviewsByProperty,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
  getPropertyStats,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/property/:propertyId', getReviewsByProperty);
router.get('/property/:propertyId/stats', getPropertyStats);

// Protected routes (require authentication)
router.post('/property/:propertyId', protect, createReview);
router.get('/user/my-reviews', protect, getUserReviews);
router.get('/:id', protect, getReviewById);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.delete('/:id/admin', protect, admin, deleteReview);

module.exports = router;
