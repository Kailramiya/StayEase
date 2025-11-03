import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaLock, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const PrivateRoute = ({ children, adminOnly = false, redirectTo = '/login' }) => {
  const { user, loading } = useAuth?.() || {};
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading for at least 300ms for better UX
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication
  if (loading || showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
            <FaSpinner className="text-blue-600 text-2xl animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Verifying Access...
          </h3>
          <p className="text-gray-600">Please wait while we check your credentials</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        replace 
        state={{ 
          from: location,
          message: 'Please login to access this page'
        }} 
      />
    );
  }

  // Admin-only route but user is not admin
  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <FaLock className="text-red-600 text-3xl" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Admin Access Required
                </p>
                <p className="text-xs text-yellow-700">
                  Current Role: <span className="font-semibold capitalize">{user.role || 'User'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Go Back
            </button>
            <Navigate to="/dashboard" replace />
          </div>

          <p className="mt-6 text-sm text-gray-500">
            If you believe this is an error, please contact support at{' '}
            <a href="mailto:support@stayease.com" className="text-blue-600 hover:underline">
              support@stayease.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
};

export default PrivateRoute;