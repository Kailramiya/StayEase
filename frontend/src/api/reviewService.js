import api from './api';

/**
 * Review Service - Handles all review-related API calls
 */

// ============================================
// Review Management
// ============================================

/**
 * Add a new review for a property
 * @param {string} propertyId - Property ID
 * @param {Object} reviewData - Review details
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment/text
 * @param {Array<string>} reviewData.images - Review images (optional)
 * @returns {Promise} Created review object
 */
export const addReview = async (propertyId, reviewData) => {
  try {
    const response = await api.post(`/reviews/property/${propertyId}`, reviewData);
    console.log('Review added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to add review:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get all reviews for a property
 * @param {string} propertyId - Property ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of reviews per page
 * @param {string} params.sortBy - Sort field (rating, createdAt, helpful)
 * @param {string} params.order - Sort order (asc, desc)
 * @param {number} params.rating - Filter by rating (1-5)
 * @returns {Promise} Array of reviews with pagination info
 */
export const getReviewsByProperty = async (propertyId, params = {}) => {
  try {
    const response = await api.get(`/reviews/property/${propertyId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property reviews:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get reviews by logged-in user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise} User's reviews array
 */
export const getReviewsByUser = async (params = {}) => {
  try {
    const response = await api.get('/reviews/user', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user reviews:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get my reviews (alias for getReviewsByUser)
 * @param {Object} params - Query parameters
 * @returns {Promise} User's reviews array
 */
export const getMyReviews = async (params = {}) => {
  return getReviewsByUser(params);
};

/**
 * Delete a review by ID (if authorized)
 * @param {string} reviewId - Review ID
 * @returns {Promise} Success response
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    console.log('Review deleted successfully:', reviewId);
    return response.data;
  } catch (error) {
    console.error('Failed to delete review:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update a review by ID
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - Fields to update
 * @param {number} updateData.rating - Updated rating
 * @param {string} updateData.comment - Updated comment
 * @returns {Promise} Updated review
 */
export const updateReview = async (reviewId, updateData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, updateData);
    console.log('Review updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update review:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get a single review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise} Review details
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch review:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Review Images
// ============================================

/**
 * Upload images for a review
 * @param {string} reviewId - Review ID
 * @param {Array<File>} images - Array of image files
 * @param {Function} onUploadProgress - Progress callback (optional)
 * @returns {Promise} Updated review with images
 */
export const uploadReviewImages = async (reviewId, images, onUploadProgress) => {
  try {
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    
    const response = await api.post(`/reviews/${reviewId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    
    console.log('Review images uploaded successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to upload review images:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Delete a review image
 * @param {string} reviewId - Review ID
 * @param {string} imageId - Image ID
 * @returns {Promise} Updated review
 */
export const deleteReviewImage = async (reviewId, imageId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}/images/${imageId}`);
    console.log('Review image deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to delete review image:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Review Interactions
// ============================================

/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 * @returns {Promise} Updated review with helpful count
 */
export const markReviewHelpful = async (reviewId) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    console.log('Review marked as helpful');
    return response.data;
  } catch (error) {
    console.error('Failed to mark review as helpful:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Remove helpful mark from review
 * @param {string} reviewId - Review ID
 * @returns {Promise} Updated review
 */
export const removeHelpfulMark = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}/helpful`);
    console.log('Helpful mark removed');
    return response.data;
  } catch (error) {
    console.error('Failed to remove helpful mark:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Report a review for inappropriate content
 * @param {string} reviewId - Review ID
 * @param {Object} reportData - Report details
 * @param {string} reportData.reason - Reason for reporting
 * @returns {Promise} Report confirmation
 */
export const reportReview = async (reviewId, reportData) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/report`, reportData);
    console.log('Review reported successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to report review:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Review Statistics
// ============================================

/**
 * Get review statistics for a property
 * @param {string} propertyId - Property ID
 * @returns {Promise} Review statistics (average rating, count by rating, etc.)
 */
export const getPropertyReviewStats = async (propertyId) => {
  try {
    const response = await api.get(`/reviews/property/${propertyId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch review stats:', error.response?.data?.message || error.message);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

/**
 * Get user's review statistics
 * @returns {Promise} User review stats (total reviews, average rating given)
 */
export const getUserReviewStats = async () => {
  try {
    const response = await api.get('/reviews/user/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user review stats:', error.response?.data?.message || error.message);
    return {
      totalReviews: 0,
      averageRating: 0
    };
  }
};

// ============================================
// Owner Response
// ============================================

/**
 * Add owner response to a review
 * @param {string} reviewId - Review ID
 * @param {Object} responseData - Response details
 * @param {string} responseData.response - Owner's response text
 * @returns {Promise} Updated review with owner response
 */
export const addOwnerResponse = async (reviewId, responseData) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/response`, responseData);
    console.log('Owner response added successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to add owner response:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update owner response
 * @param {string} reviewId - Review ID
 * @param {Object} responseData - Updated response
 * @returns {Promise} Updated review
 */
export const updateOwnerResponse = async (reviewId, responseData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}/response`, responseData);
    console.log('Owner response updated successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to update owner response:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Delete owner response
 * @param {string} reviewId - Review ID
 * @returns {Promise} Updated review
 */
export const deleteOwnerResponse = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}/response`);
    console.log('Owner response deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to delete owner response:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Additional Features
// ============================================

/**
 * Check if user can review a property (based on booking)
 * @param {string} propertyId - Property ID
 * @returns {Promise} Object with canReview boolean and reason
 */
export const canUserReview = async (propertyId) => {
  try {
    const response = await api.get(`/reviews/property/${propertyId}/can-review`);
    return response.data;
  } catch (error) {
    console.error('Failed to check review eligibility:', error.response?.data?.message || error.message);
    return { canReview: false, reason: 'Unknown error' };
  }
};

/**
 * Get recent reviews across all properties
 * @param {number} limit - Number of reviews to fetch
 * @returns {Promise} Recent reviews array
 */
export const getRecentReviews = async (limit = 10) => {
  try {
    const response = await api.get(`/reviews/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent reviews:', error.response?.data?.message || error.message);
    return { reviews: [] };
  }
};

/**
 * Get top-rated reviews
 * @param {number} limit - Number of reviews to fetch
 * @returns {Promise} Top-rated reviews array
 */
export const getTopRatedReviews = async (limit = 10) => {
  try {
    const response = await api.get(`/reviews/top-rated?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top-rated reviews:', error.response?.data?.message || error.message);
    return { reviews: [] };
  }
};

/**
 * Search reviews by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} params - Additional parameters
 * @returns {Promise} Matching reviews
 */
export const searchReviews = async (keyword, params = {}) => {
  try {
    const response = await api.get('/reviews/search', {
      params: { keyword, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search reviews:', error.response?.data?.message || error.message);
    return { reviews: [] };
  }
};
