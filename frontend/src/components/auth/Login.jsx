import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getCookie } from '../../utils/cookies';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserShield, FaUser } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    // Clear field-specific error
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  React.useEffect(() => {
    try {
      const raw = getCookie('user');
      if (raw) {
        try {
          const stored = JSON.parse(raw || '{}');
          const token = stored?.token || stored?.user?.token;
          if (token) navigate('/', { replace: true });
        } catch (e) {
          // malformed JSON in cookie — treat as not-logged-in
        }
      }
    } catch (err) {
      // ignore
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
  const data = await login({ ...formData, role });
  const resolvedRole = data?.role || role;
      navigate(resolvedRole === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">StayEase</h1>
          <p className="text-gray-600">Your perfect rental awaits</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to continue to your account
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

          {/* General Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative has-left-icon">
                <div className="left-icon">
                  <FaEnvelope className={fieldErrors.email ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-with-left-icon w-full pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative has-left-icon has-right-icon">
                <div className="left-icon">
                  <FaLock className={fieldErrors.password ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-with-left-icon input-with-right-icon w-full pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="right-icon text-gray-500 hover:text-gray-700 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {loading && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              )}
              {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'User'}`}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 font-medium mb-2">🔐 Demo Credentials:</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p><strong>User:</strong> user@example.com / password123</p>
            <p><strong>Admin:</strong> admin@example.com / admin123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;