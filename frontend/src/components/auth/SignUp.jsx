import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, getCurrentUser } from '../../api/authService';
import useAuth from '../../hooks/useAuth';
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock,
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, message: '', color: '' };

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
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
    
    if (!formData.name.trim()) {
      e.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Enter a valid email address';
    }

    if (!formData.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
      e.phone = 'Enter a valid 10-digit Indian phone number';
    }

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));

    // Calculate password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eMap = validate();
    if (Object.keys(eMap).length) {
      setErrors(eMap);
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...payload } = formData;
      const data = await registerUser({ ...payload, role });

      // Fetch current user from backend (will also update cookie) and set in context
      try {
        const current = await getCurrentUser();
        setUser(current);
      } catch (err) {
        // non-fatal - continue
        console.warn('Failed to fetch current user after registration', err);
      }

      // Show success message before redirecting home
      setSuccess(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data || {};
      if (status === 409) {
        const field =
          data.field ||
          (data.message?.toLowerCase()?.includes('phone') ? 'phone' : 'email');
        const msg =
          data.message ||
          (field === 'phone' ? 'Phone number already registered' : 'Email already exists. Try logging in.');
        setErrors((prev) => ({ ...prev, [field]: msg, form: msg }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: data.message || 'Registration failed. Please try again.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'One number', met: /\d/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">StayEase</h1>
          <p className="text-gray-600">Find your perfect rental home</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Create Account
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Sign up to get started
          </p>

          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  role === 'user'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaUser />
                User
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  role === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaUserShield />
                Admin
              </button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-fadeIn">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-semibold">Account Created Successfully!</p>
                  <p className="text-green-700 text-sm mt-1">Redirecting to your dashboard...</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Error */}
          {errors.form && !success && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="name">
                Full Name
              </label>
              <div className="relative has-left-icon">
                <div className="left-icon flex items-center pointer-events-none">
                  <FaUser className={errors.name ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`input-with-left-icon w-full pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative has-left-icon">
                <div className="left-icon">
                  <FaEnvelope className={errors.email ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`input-with-left-icon w-full pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative has-left-icon">
                <div className="left-icon">
                  <FaPhone className={errors.phone ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={`input-with-left-icon w-full pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.phone
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative has-left-icon has-right-icon">
                <div className="left-icon flex items-center pointer-events-none">
                  <FaLock className={errors.password ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`input-with-left-icon input-with-right-icon w-full pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="right-icon text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
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

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                  <ul className="space-y-1">
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
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative has-left-icon has-right-icon">
                <div className="left-icon flex items-center pointer-events-none">
                  <FaLock className={errors.confirmPassword ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`input-with-left-icon input-with-right-icon w-full pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="right-icon text-gray-500 hover:text-gray-700 transition"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {loading && !success && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              )}
              {success && <FaCheckCircle />}
              {success ? 'Account Created!' : loading ? 'Creating Account...' : `Sign Up as ${role === 'admin' ? 'Admin' : 'User'}`}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
};

export default Signup;