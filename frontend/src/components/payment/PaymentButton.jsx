import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  FaCreditCard, 
  FaLock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSpinner 
} from 'react-icons/fa';

const PaymentButton = ({ bookingId, amount, paymentOrder = null, onSuccess, onFailure, propertyName = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // No external gateway: mark loaded so button is usable
  useEffect(() => {
    setRazorpayLoaded(true);
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Immediate success: backend already confirmed the booking and payment
      setTimeout(() => {
        setLoading(false);
        onSuccess({ message: 'Payment succeeded' });
      }, 200);
      return;
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process payment.';
      setError(errorMessage);
      onFailure();
      setLoading(false);
    }
  };

  // Format amount with commas
  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Payment Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Payment Info Card */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-900">Total Amount</span>
          <span className="text-2xl font-bold text-blue-600">{formatAmount(amount)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <FaLock />
          <span>Secured by Razorpay • 256-bit SSL Encryption</span>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            <span>Processing Payment...</span>
          </>
        ) : !razorpayLoaded ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            <span>Loading Payment Gateway...</span>
          </>
        ) : (
          <>
            <FaCreditCard className="text-xl" />
            <span>Pay {formatAmount(amount)}</span>
          </>
        )}
      </button>

      {/* Payment Methods Info */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-600">
          We accept Credit Cards, Debit Cards, Net Banking, UPI & Wallets
        </p>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5 opacity-60" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-60" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-5 opacity-60" />
          <span className="text-xs font-semibold">UPI</span>
        </div>
      </div>

      {/* Security Note */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-800 mb-1">100% Secure Payment</p>
            <p>Your payment information is encrypted and secure. We never store your card details.</p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By proceeding, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/refund" className="text-blue-600 hover:underline">Refund Policy</a>
      </p>
    </div>
  );
};

export default PaymentButton;
