import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarCheck, 
  FaHeart, 
  FaStar, 
  FaHome,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { getMyBookings } from '../api/bookingService';
import { getFavorites } from '../api/favoriteService';
import AIRecommendationCard from '../components/property/AIRecommendationCard';
import useAuth from '../hooks/useAuth';
import { buildAiSignalsForProperty, loadLastSearch } from '../utils/aiRecommendations';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const favoriteIds = useMemo(() => {
    return (favorites || [])
      .map((f) => String(f?.property?._id || f?.property || ''))
      .filter(Boolean);
  }, [favorites]);

  const lastSearch = useMemo(() => loadLastSearch(), []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        const bookingList = data.data || data.bookings || data || [];
        setBookings(Array.isArray(bookingList) ? bookingList : []);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const data = await getFavorites();
        const favList = data.favorites || data.data || data || [];
        setFavorites(Array.isArray(favList) ? favList : []);
      } catch (error) {
        console.error('Failed to fetch favorites', error);
        setFavorites([]);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchBookings();
    fetchFavorites();
  }, [user, navigate]);

  const handleFavoriteToggle = (propertyId, isFavorite) => {
    if (!isFavorite) {
      setFavorites((prev) => prev.filter((fav) => {
        const favPropertyId = fav.property?._id || fav.property;
        return favPropertyId !== propertyId;
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateStats = () => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const totalSpent = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + ((b.totalPrice || b.totalAmount) || 0), 0);
    
    return { totalBookings, activeBookings, totalSpent };
  };

  const stats = calculateStats();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FaCalendarCheck className="text-3xl opacity-80" />
            <span className="text-3xl font-bold">{stats.totalBookings}</span>
          </div>
          <p className="text-blue-100">Total Bookings</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FaHome className="text-3xl opacity-80" />
            <span className="text-3xl font-bold">{stats.activeBookings}</span>
          </div>
          <p className="text-green-100">Active Bookings</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FaMoneyBillWave className="text-3xl opacity-80" />
            <span className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</span>
          </div>
          <p className="text-purple-100">Total Spent</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-left transition"
          >
            <FaHome className="text-2xl mb-2" />
            <p className="font-semibold">Browse Properties</p>
            <p className="text-sm text-gray-600">Find your next home</p>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg text-left transition"
          >
            <FaCalendarCheck className="text-2xl mb-2" />
            <p className="font-semibold">My Bookings</p>
            <p className="text-sm text-gray-600">View booking history</p>
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-lg text-left transition"
          >
            <FaHeart className="text-2xl mb-2" />
            <p className="font-semibold">Favorites</p>
            <p className="text-sm text-gray-600">View saved properties</p>
          </button>
        </div>
      </div>

      {/* Recent Bookings Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Bookings</h3>
          <button
            onClick={() => setActiveTab('bookings')}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            View All →
          </button>
        </div>
        {loadingBookings ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking) => (
              <div key={booking._id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-semibold">{booking.property?.title || 'Property'}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Bookings</h2>
      {loadingBookings ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaCalendarCheck className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">You have no bookings yet.</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="md:flex">
                {/* Property Image */}
                <div className="md:w-1/4">
                  <img
                    src={booking.property?.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={booking.property?.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{booking.property?.title || 'Property'}</h3>
                      <p className="text-gray-600 text-sm">
                        {booking.property?.address?.city}, {booking.property?.address?.state}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-semibold">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-blue-600">₹{(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/properties/${booking.property?._id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                    >
                      View Property
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          // ensure user is logged in (page already protects, but guard here too)
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          const propId = booking.property?._id || booking.property;
                          if (propId) navigate(`/contact-owner/${propId}`);
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-semibold"
                      >
                        Contact Owner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Favorite Properties</h2>
      {loadingFavorites ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaHeart className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">You have no favorite properties yet.</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const property = fav.property;
            if (!property || !property._id) return null;

            const ai = buildAiSignalsForProperty({
              property,
              user,
              favorites: favoriteIds,
              lastSearch,
              mode: user ? 'auto' : 'preview',
            });
            return (
              <AIRecommendationCard
                key={fav._id || property._id}
                property={property}
                ai={ai}
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Manage your bookings and favorite properties</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaHome />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaCalendarCheck />
              Bookings
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'favorites'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaHeart />
              Favorites
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'favorites' && renderFavorites()}
      </div>
    </div>
  );
};

export default Dashboard;
