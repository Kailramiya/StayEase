import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/authService';
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });

  useEffect(() => {
    if (!token) {
      setFormError('Invalid or missing reset token');
    }
  }, [token]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, message: '', color: '' };

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;

    // Contains numbers
    if (/\d/.test(password)) score += 1;

    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let message = '';
    let color = '';

    if (score <= 2) {
      message = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 4) {
      message = 'Medium';
      color = 'bg-yellow-500';
    } else {
      message = 'Strong';
      color = 'bg-green-500';
    }

    return { score, message, color };
  };

  const validate = () => {
    const e = {};
    
    if (!formData.password) {
      e.password = 'Password is required';
    } else if (formData.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      e.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      e.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      e.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
    setSuccess('');

    // Calculate password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    const eMap = validate();
    if (Object.keys(eMap).length) {
      setErrors(eMap);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, formData.password);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMsg = err.response?.data?.message || 
                      'Password reset failed. The link may have expired or is invalid.';
      setFormError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'One number', met: /\d/.test(formData.password) },
    { label: 'One special character (recommended)', met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaLock className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Success!</h4>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className={errors.password ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || !!success}
                  className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || !!success}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" />
                  {errors.password}
                </p>
              )}

              {/* Password Strength Indicator */}
              {formData.password && !errors.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.score <= 2 ? 'text-red-600' :
                      passwordStrength.score <= 4 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className={errors.confirmPassword ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || !!success}
                  className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={loading || !!success}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" />
                  {errors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                <ul className="space-y-1.5">
                  {passwordRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {loading && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              )}
              {loading ? 'Resetting Password...' : success ? 'Password Reset!' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800 text-center">
            ⚠️ For security reasons, this password reset link can only be used once and expires after 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;