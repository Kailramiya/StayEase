import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FaExclamationTriangle className="text-yellow-500 text-6xl animate-bounce" />
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Don't worry, even the best explorers get lost sometimes! 🗺️
          </p>

          {/* Helpful Links */}
          <div className="border-t pt-6">
            <p className="text-gray-700 font-semibold mb-4">Here are some helpful links instead:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg transform hover:scale-105"
              >
                <FaHome />
                Go to Homepage
              </Link>
              
              <Link
                to="/properties"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition shadow-lg transform hover:scale-105"
              >
                <FaSearch />
                Browse Properties
              </Link>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800 font-semibold underline"
        >
          ← Go back to previous page
        </button>

        {/* Fun Illustration */}
        <div className="mt-8 text-6xl opacity-50 animate-bounce">
          🏠❓
        </div>
      </div>
    </div>
  );
};

export default NotFound;
