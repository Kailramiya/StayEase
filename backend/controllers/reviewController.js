// filepath: [reviewController.js](http://_vscodecontentref_/0)
const Review = require('../models/Review');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Create a new review
// @route   POST /api/reviews/property/:propertyId
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = req.params.propertyId; // Property from URL
    const userId = req.user._id; // User from auth middleware

    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user has already reviewed this property
    const existingReview = await Review.findOne({
      user: userId,
      property: property,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }

    // Create review with both user and property
    const review = await Review.create({
      user: userId, // From authenticated user
      property, // From URL parameter
      rating: Number(rating),
      comment: comment || '',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('property', 'title');

    // Update property rating and review count
    await updatePropertyRating(property);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message || 'Failed to create review' });
  }
};

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
const getReviewsByProperty = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rating statistics for a property
// @route   GET /api/reviews/property/:propertyId/stats
// @access  Public
const getPropertyStats = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId });

    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });
    }

    const totalReviews = reviews.length;
    const sumRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = sumRating / totalReviews;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }
    });

    res.json({
      success: true,
      data: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Private
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name email')
      .populate('property', 'title');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews by logged-in user
// @route   GET /api/reviews/user/my-reviews
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('property', 'title address images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating !== undefined ? Number(rating) : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;

    await review.save();

    const updatedReview = await Review.findById(review._id).populate('user', 'name email');

    // Update property rating
    await updatePropertyRating(review.property);

    res.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const propertyId = review.property;
    await review.deleteOne();

    // Update property rating
    await updatePropertyRating(propertyId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update property rating
const updatePropertyRating = async (propertyId) => {
  try {
    const reviews = await Review.find({ property: propertyId });
    
    if (reviews.length === 0) {
      await Property.findByIdAndUpdate(propertyId, {
        rating: 0,
        numReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Property.findByIdAndUpdate(propertyId, {
      rating: Number(averageRating.toFixed(1)),
      numReviews: reviews.length,
    });
  } catch (error) {
    console.error('Update property rating error:', error);
  }
};

module.exports = {
  createReview,
  getReviewsByProperty,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
  getPropertyStats,
};