import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaHome,
  FaBuilding,
  FaTachometerAlt,
  FaHeart,
  FaUserCircle,
  FaUserShield,
  FaCog,
  FaChevronDown
} from 'react-icons/fa';

const navLinks = [
  { name: 'Home', path: '/', icon: FaHome },
  { name: 'Properties', path: '/properties', icon: FaBuilding },
  { name: 'Dashboard', path: '/dashboard', private: true, icon: FaTachometerAlt },
  { name: 'Favorites', path: '/favorites', private: true, icon: FaHeart },
  { name: 'Profile', path: '/profile', private: true, icon: FaUserCircle },
  { name: 'Admin', path: '/admin', adminOnly: true, icon: FaUserShield },
];

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isForgotPasswordPage = location.pathname === '/forgot-password';
  const isPasswordResetPage = location.pathname.startsWith('/reset-password');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition group"
        >
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition">
            <FaHome className="text-white text-xl" />
          </div>
          <span className="hidden sm:inline">StayEase</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.private && !user) return null;
            if (link.adminOnly && user?.role !== 'admin') return null;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`
                }
              >
                <link.icon className="text-base" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Desktop User Menu */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 leading-tight">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">
                        {user.role === 'admin' ? 'Administrator' : 'Member'}
                      </p>
                    </div>
                  </div>
                  <FaChevronDown className={`text-gray-600 text-sm transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700 text-sm"
                    >
                      <FaUserCircle className="text-gray-400" />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700 text-sm"
                    >
                      <FaTachometerAlt className="text-gray-400" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700 text-sm"
                    >
                      <FaHeart className="text-gray-400" />
                      <span>Favorites</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-gray-700 text-sm"
                      >
                        <FaUserShield className="text-gray-400" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-red-600 text-sm w-full"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="md:hidden flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm"
              >
                <FaSignOutAlt size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Auth Buttons */}
              {isSignupPage || isForgotPasswordPage || isPasswordResetPage ? (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                >
                  <FaUser size={14} />
                  <span>Login</span>
                </Link>
              ) : isLoginPage ? (
                <Link
                  to="/signup"
                  className="hidden sm:flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                >
                  <span>Sign Up</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                  >
                    <FaUser size={14} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              if (link.private && !user) return null;
              if (link.adminOnly && user?.role !== 'admin') return null;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <link.icon className="text-lg" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
            
            {!user && (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
              >
                <FaUser className="text-lg" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;