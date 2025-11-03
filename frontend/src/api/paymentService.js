import api from './api';

/**
 * Payment Service - Handles all payment-related API calls
 * Supports Razorpay, Stripe, and other payment gateways
 */

// ============================================
// Order Management
// ============================================

/**
 * Create a payment order
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.bookingId - Booking ID
 * @param {number} paymentData.amount - Payment amount in INR
 * @param {string} paymentData.currency - Currency code (default: INR)
 * @param {string} paymentData.paymentMethod - Payment method (razorpay, stripe, upi, etc.)
 * @returns {Promise} Order details with payment gateway info
 */
export const createOrder = async (paymentData) => {
  try {
    const response = await api.post('/payments/create-order', paymentData);
    console.log('Payment order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create payment order:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Verify payment after completion
 * @param {Object} paymentDetails - Payment verification data
 * @param {string} paymentDetails.orderId - Order ID
 * @param {string} paymentDetails.paymentId - Payment ID from gateway
 * @param {string} paymentDetails.signature - Payment signature for verification
 * @returns {Promise} Verification result
 */
export const verifyPayment = async (paymentDetails) => {
  try {
    const response = await api.post('/payments/verify', paymentDetails);
    console.log('Payment verified successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Payment verification failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get payment details by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise} Payment details
 */
export const getPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment details:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Payment History
// ============================================

/**
 * Get all payments of logged-in user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @param {string} params.status - Filter by status (pending, success, failed, refunded)
 * @returns {Promise} Array of user payments
 */
export const getMyPayments = async (params = {}) => {
  try {
    const response = await api.get('/payments/my', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user payments:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get payment history for a specific booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise} Payment history for the booking
 */
export const getPaymentsByBooking = async (bookingId) => {
  try {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking payments:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Refunds
// ============================================

/**
 * Request payment refund
 * @param {string} paymentId - Payment ID
 * @param {Object} refundData - Refund details
 * @param {number} refundData.amount - Refund amount (optional, full refund if not provided)
 * @param {string} refundData.reason - Reason for refund
 * @returns {Promise} Refund request details
 */
export const requestRefund = async (paymentId, refundData) => {
  try {
    const response = await api.post(`/payments/${paymentId}/refund`, refundData);
    console.log('Refund requested:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to request refund:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get refund status
 * @param {string} refundId - Refund ID
 * @returns {Promise} Refund status details
 */
export const getRefundStatus = async (refundId) => {
  try {
    const response = await api.get(`/payments/refunds/${refundId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch refund status:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get all refunds of logged-in user
 * @param {Object} params - Query parameters
 * @returns {Promise} Array of user refunds
 */
export const getMyRefunds = async (params = {}) => {
  try {
    const response = await api.get('/payments/my/refunds', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user refunds:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Payment Methods
// ============================================

/**
 * Get available payment methods
 * @returns {Promise} List of available payment methods
 */
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/payments/methods');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment methods:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Save payment method for future use
 * @param {Object} methodData - Payment method details
 * @param {string} methodData.type - Method type (card, upi, netbanking)
 * @param {Object} methodData.details - Method-specific details
 * @returns {Promise} Saved payment method
 */
export const savePaymentMethod = async (methodData) => {
  try {
    const response = await api.post('/payments/methods/save', methodData);
    console.log('Payment method saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to save payment method:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get saved payment methods
 * @returns {Promise} List of saved payment methods
 */
export const getSavedPaymentMethods = async () => {
  try {
    const response = await api.get('/payments/methods/saved');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch saved payment methods:', error.response?.data?.message || error.message);
    return { methods: [] };
  }
};

/**
 * Delete saved payment method
 * @param {string} methodId - Payment method ID
 * @returns {Promise} Success response
 */
export const deletePaymentMethod = async (methodId) => {
  try {
    const response = await api.delete(`/payments/methods/${methodId}`);
    console.log('Payment method deleted:', methodId);
    return response.data;
  } catch (error) {
    console.error('Failed to delete payment method:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Receipts & Invoices
// ============================================

/**
 * Download payment receipt
 * @param {string} paymentId - Payment ID
 * @returns {Promise} PDF blob
 */
export const downloadReceipt = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `payment-receipt-${paymentId}.pdf`;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
    
    console.log('Receipt downloaded:', paymentId);
    return { success: true };
  } catch (error) {
    console.error('Failed to download receipt:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Email payment receipt
 * @param {string} paymentId - Payment ID
 * @param {string} email - Email address (optional, uses user's email if not provided)
 * @returns {Promise} Success response
 */
export const emailReceipt = async (paymentId, email = null) => {
  try {
    const response = await api.post(`/payments/${paymentId}/email-receipt`, { email });
    console.log('Receipt emailed to:', email || 'user email');
    return response.data;
  } catch (error) {
    console.error('Failed to email receipt:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Payment Statistics
// ============================================

/**
 * Get payment statistics for user
 * @returns {Promise} Payment statistics (total spent, successful payments, etc.)
 */
export const getPaymentStats = async () => {
  try {
    const response = await api.get('/payments/my/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment stats:', error.response?.data?.message || error.message);
    return { 
      totalSpent: 0, 
      successfulPayments: 0, 
      failedPayments: 0, 
      refundedAmount: 0 
    };
  }
};

// ============================================
// UPI Payments
// ============================================

/**
 * Generate UPI payment QR code
 * @param {Object} upiData - UPI payment details
 * @param {string} upiData.orderId - Order ID
 * @param {number} upiData.amount - Payment amount
 * @param {string} upiData.upiId - UPI ID (optional)
 * @returns {Promise} QR code image URL
 */
export const generateUpiQR = async (upiData) => {
  try {
    const response = await api.post('/payments/upi/generate-qr', upiData);
    console.log('UPI QR code generated');
    return response.data;
  } catch (error) {
    console.error('Failed to generate UPI QR:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Verify UPI payment
 * @param {string} transactionId - UPI transaction ID
 * @returns {Promise} Verification result
 */
export const verifyUpiPayment = async (transactionId) => {
  try {
    const response = await api.post('/payments/upi/verify', { transactionId });
    console.log('UPI payment verified:', transactionId);
    return response.data;
  } catch (error) {
    console.error('Failed to verify UPI payment:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Payment Gateway Integration
// ============================================

/**
 * Initialize Razorpay payment
 * @param {Object} orderData - Order details
 * @returns {Promise} Razorpay options for checkout
 */
export const initializeRazorpay = async (orderData) => {
  try {
    const response = await api.post('/payments/razorpay/initialize', orderData);
    console.log('Razorpay initialized');
    return response.data;
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Process Stripe payment
 * @param {Object} paymentData - Stripe payment details
 * @returns {Promise} Stripe payment intent
 */
export const processStripePayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/stripe/process', paymentData);
    console.log('Stripe payment processed');
    return response.data;
  } catch (error) {
    console.error('Failed to process Stripe payment:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Webhooks (for admin/internal use)
// ============================================

/**
 * Handle payment webhook
 * @param {Object} webhookData - Webhook payload
 * @returns {Promise} Webhook processing result
 */
export const handlePaymentWebhook = async (webhookData) => {
  try {
    const response = await api.post('/payments/webhook', webhookData);
    console.log('Payment webhook processed');
    return response.data;
  } catch (error) {
    console.error('Failed to process payment webhook:', error.response?.data?.message || error.message);
    throw error;
  }
};
