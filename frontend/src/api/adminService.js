import api from './api';

/**
 * Admin Service - Handles all admin-related API calls
 * All endpoints require admin authentication
 */

// ============================================
// Dashboard & Statistics
// ============================================

/**
 * Fetch dashboard statistics
 * @returns {Promise} Dashboard stats (total users, properties, bookings, revenue, etc.)
 */
export const fetchDashboardStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch analytics data for charts
 * @param {string} period - Time period (week, month, year)
 * @returns {Promise} Analytics data
 */
export const fetchAnalytics = async (period = 'month') => {
  try {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};

// ============================================
// User Management
// ============================================

/**
 * Fetch all users
 * @param {Object} params - Query parameters (page, limit, search, role)
 * @returns {Promise} List of users
 */
export const fetchAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    console.log('Fetched users:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise} User details
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

/**
 * Update user details
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise} Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise} Success message
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};

/**
 * Update a user's password (admin only)
 * @param {string} userId - User ID
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise} Success message
 */
export const updateUserPassword = async (userId, password, confirmPassword) => {
  try {
    const response = await api.put(`/admin/users/${userId}/password`, {
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update user password:', error);
    throw error;
  }
};

/**
 * Toggle user status (active/inactive)
 * @param {string} userId - User ID
 * @returns {Promise} Updated user
 */
export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    throw error;
  }
};

// ============================================
// Property Management
// ============================================

/**
 * Fetch all properties
 * @param {Object} params - Query parameters (page, limit, search, status)
 * @returns {Promise} List of properties
 */
export const fetchAllProperties = async (params = {}) => {
  try {
    const response = await api.get('/admin/properties', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }
};

/**
 * Get property by ID
 * @param {string} propertyId - Property ID
 * @returns {Promise} Property details
 */
export const getPropertyById = async (propertyId) => {
  try {
    const response = await api.get(`/admin/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    throw error;
  }
};

/**
 * Create new property
 * @param {Object} propertyData - Property data
 * @returns {Promise} Created property
 */
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/admin/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Failed to create property:', error);
    throw error;
  }
};

/**
 * Update property
 * @param {string} propertyId - Property ID
 * @param {Object} propertyData - Property data to update (can include status)
 * @returns {Promise} Updated property
 */
export const updateProperty = async (propertyId, propertyData) => {
  try {
    const response = await api.put(`/admin/properties/${propertyId}`, propertyData);
    return response.data;
  } catch (error) {
    console.error('Failed to update property:', error);
    throw error;
  }
};

/**
 * Delete property
 * @param {string} propertyId - Property ID
 * @returns {Promise} Success message
 */
export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/admin/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete property:', error);
    throw error;
  }
};

/**
 * Verify property
 * @param {string} propertyId - Property ID
 * @returns {Promise} Updated property
 */
export const verifyProperty = async (propertyId) => {
  try {
    const response = await api.patch(`/admin/properties/${propertyId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Failed to verify property:', error);
    throw error;
  }
};

/**
 * Update property status
 * @param {string} propertyId - Property ID
 * @param {string} status - New status (available, booked, maintenance)
 * @returns {Promise} Updated property
 */
export const updatePropertyStatus = async (propertyId, status) => {
  try {
    const response = await api.patch(`/admin/properties/${propertyId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Failed to update property status:', error);
    throw error;
  }
};

// ============================================
// Booking Management
// ============================================

/**
 * Fetch all bookings
 * @param {Object} params - Query parameters (page, limit, status, userId, propertyId)
 * @returns {Promise} List of bookings
 */
export const fetchAllBookings = async (params = {}) => {
  try {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/admin/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    throw error;
  }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status (pending, confirmed, cancelled, completed)
 * @returns {Promise} Updated booking
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Failed to update booking status:', error);
    throw error;
  }
};

/**
 * Delete booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise} Success message
 */
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/admin/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw error;
  }
};

// ============================================
// Review Management
// ============================================

/**
 * Fetch all reviews
 * @param {Object} params - Query parameters (page, limit, propertyId, userId)
 * @returns {Promise} List of reviews
 */
export const fetchAllReviews = async (params = {}) => {
  try {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
};

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @returns {Promise} Success message
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete review:', error);
    throw error;
  }
};

/**
 * Approve/reject review
 * @param {string} reviewId - Review ID
 * @param {boolean} approved - Approval status
 * @returns {Promise} Updated review
 */
export const moderateReview = async (reviewId, approved) => {
  try {
    const response = await api.patch(`/admin/reviews/${reviewId}/moderate`, { approved });
    return response.data;
  } catch (error) {
    console.error('Failed to moderate review:', error);
    throw error;
  }
};

// ============================================
// Reports & Exports
// ============================================

/**
 * Export data to CSV
 * @param {string} type - Data type (users, properties, bookings)
 * @param {Object} params - Filter parameters
 * @returns {Promise} CSV file blob
 */
export const exportToCSV = async (type, params = {}) => {
  try {
    const response = await api.get(`/admin/export/${type}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
};

/**
 * Generate report
 * @param {string} reportType - Report type (revenue, bookings, users)
 * @param {Object} params - Report parameters (startDate, endDate)
 * @returns {Promise} Report data
 */
export const generateReport = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/admin/reports/${reportType}`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
};

// ============================================
// Settings & Configuration
// ============================================

/**
 * Update platform settings
 * @param {Object} settings - Settings to update
 * @returns {Promise} Updated settings
 */
export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
};

/**
 * Get platform settings
 * @returns {Promise} Platform settings
 */
export const getSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};

