import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { forgotPassword } from '../../api/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setMessage('Password reset link has been sent to your email');
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <FaArrowLeft />
          <span>Back to Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaEnvelope className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Success Message */}
          {submitted && message && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Email Sent!</h4>
                <p className="text-green-700 text-sm">{message}</p>
                <p className="text-green-600 text-xs mt-2">
                  Check your inbox and spam folder. The link expires in 1 hour.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setMessage('');
                  }}
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading || submitted}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || submitted}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Sending...</span>
                </>
              ) : submitted ? (
                <>
                  <FaCheckCircle />
                  <span>Email Sent</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {submitted && (
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                  setError('');
                }}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Send Another Email
              </button>
            )}
          </form>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Need help?</span> Contact our support team at{' '}
            <a href="mailto:support@stayease.com" className="text-blue-600 hover:text-blue-700">
              support@stayease.com
            </a>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            🔒 For your security, password reset links expire after 1 hour and can only be used once.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
