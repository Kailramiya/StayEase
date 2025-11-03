import api from './api';

/**
 * Booking Service - Handles all booking-related API calls
 */

// ============================================
// Booking Management
// ============================================

/**
 * Create a new booking
 * @param {Object} bookingData - Booking details
 * @param {string} bookingData.property - Property ID
 * @param {string} bookingData.checkIn - Check-in date (ISO format)
 * @param {string} bookingData.checkOut - Check-out date (ISO format)
 * @param {number} bookingData.totalAmount - Total booking amount
 * @param {Object} bookingData.paymentDetails - Payment information (optional)
 * @returns {Promise} Created booking object
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    console.log('Booking created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create booking:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get all bookings of logged-in user
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, confirmed, cancelled, completed)
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @returns {Promise} User's bookings array
 */
export const getMyBookings = async (params = {}) => {
  try {
    const response = await api.get('/bookings/my', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user bookings:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get a specific booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking details:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update booking status (admin or property owner only)
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status (pending, confirmed, cancelled, completed)
 * @returns {Promise} Updated booking object
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    console.log('Booking status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update booking status:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason (optional)
 * @returns {Promise} Cancelled booking object
 */
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    console.log('Booking cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to cancel booking:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Extend booking check-out date
 * @param {string} bookingId - Booking ID
 * @param {string} newCheckOutDate - New check-out date (ISO format)
 * @returns {Promise} Updated booking object
 */
export const extendBooking = async (bookingId, newCheckOutDate) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/extend`, { 
      newCheckOut: newCheckOutDate 
    });
    console.log('Booking extended:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to extend booking:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Additional Booking Features
// ============================================

/**
 * Get booking statistics for user
 * @returns {Promise} Booking statistics (total, upcoming, completed, cancelled)
 */
export const getBookingStats = async () => {
  try {
    const response = await api.get('/bookings/my/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking stats:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get upcoming bookings
 * @param {number} limit - Number of bookings to fetch
 * @returns {Promise} Upcoming bookings array
 */
export const getUpcomingBookings = async (limit = 5) => {
  try {
    const response = await api.get('/bookings/my/upcoming', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch upcoming bookings:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get booking history (past bookings)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise} Past bookings array
 */
export const getBookingHistory = async (params = {}) => {
  try {
    const response = await api.get('/bookings/my/history', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking history:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Check booking availability for a property
 * @param {string} propertyId - Property ID
 * @param {string} checkIn - Check-in date (ISO format)
 * @param {string} checkOut - Check-out date (ISO format)
 * @returns {Promise} Availability status
 */
export const checkAvailability = async (propertyId, checkIn, checkOut) => {
  try {
    const response = await api.post('/bookings/check-availability', {
      property: propertyId,
      checkIn,
      checkOut
    });
    return response.data;
  } catch (error) {
    console.error('Failed to check availability:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Calculate booking price
 * @param {string} propertyId - Property ID
 * @param {string} checkIn - Check-in date (ISO format)
 * @param {string} checkOut - Check-out date (ISO format)
 * @returns {Promise} Price breakdown
 */
export const calculateBookingPrice = async (propertyId, checkIn, checkOut) => {
  try {
    const response = await api.post('/bookings/calculate-price', {
      property: propertyId,
      checkIn,
      checkOut
    });
    return response.data;
  } catch (error) {
    console.error('Failed to calculate price:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Confirm booking payment
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.paymentMethod - Payment method (card, upi, etc.)
 * @param {string} paymentData.transactionId - Transaction ID
 * @returns {Promise} Updated booking with payment confirmation
 */
export const confirmPayment = async (bookingId, paymentData) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/confirm-payment`, paymentData);
    console.log('Payment confirmed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to confirm payment:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Request booking refund
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Refund reason
 * @returns {Promise} Refund request status
 */
export const requestRefund = async (bookingId, reason) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/request-refund`, { reason });
    console.log('Refund requested:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to request refund:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Download booking receipt/invoice
 * @param {string} bookingId - Booking ID
 * @returns {Promise} PDF blob
 */
export const downloadBookingReceipt = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}/receipt`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `booking-receipt-${bookingId}.pdf`;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to download receipt:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Add review after booking completion
 * @param {string} bookingId - Booking ID
 * @param {Object} reviewData - Review details
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise} Created review
 */
export const addBookingReview = async (bookingId, reviewData) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
    console.log('Review added:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to add review:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update booking details (before confirmation)
 * @param {string} bookingId - Booking ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} Updated booking
 */
export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await api.put(`/bookings/${bookingId}`, updateData);
    console.log('Booking updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update booking:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get bookings for a specific property (owner only)
 * @param {string} propertyId - Property ID
 * @param {Object} params - Query parameters
 * @returns {Promise} Property bookings
 */
export const getPropertyBookings = async (propertyId, params = {}) => {
  try {
    const response = await api.get(`/bookings/property/${propertyId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property bookings:', error.response?.data?.message || error.message);
    throw error;
  }
};
