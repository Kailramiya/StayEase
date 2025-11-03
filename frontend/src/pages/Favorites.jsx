import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaHeartBroken, FaFilter, FaTh, FaList } from 'react-icons/fa';
import { getFavorites } from '../api/favoriteService';
import PropertyCard from '../components/property/PropertyCard';
import useAuth from '../hooks/useAuth';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price-low', 'price-high', 'rating'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getFavorites();
        const favList = response.favorites || response.data || response || [];
        const validFavorites = Array.isArray(favList) ? favList.filter(fav => fav.property && fav.property._id) : [];
        setFavorites(validFavorites);
        setFilteredFavorites(validFavorites);
      } catch (err) {
        console.error('Failed to fetch favorites', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user, navigate]);

  useEffect(() => {
    // Sort favorites
    let sorted = [...favorites];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.property?.price?.monthly || 0) - (b.property?.price?.monthly || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.property?.price?.monthly || 0) - (a.property?.price?.monthly || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.property?.rating || 0) - (a.property?.rating || 0));
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    setFilteredFavorites(sorted);
  }, [sortBy, favorites]);

  const handleFavoriteToggle = (propertyId, isFavorite) => {
    if (!isFavorite) {
      setFavorites((prev) => prev.filter((fav) => {
        const favPropertyId = fav.property?._id || fav.property;
        return favPropertyId !== propertyId;
      }));
      setFilteredFavorites((prev) => prev.filter((fav) => {
        const favPropertyId = fav.property?._id || fav.property;
        return favPropertyId !== propertyId;
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaHeartBroken className="text-red-400 text-6xl mx-auto mb-4" />
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding properties to your favorites to see them here!
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <FaHeart className="text-red-500" />
              Your Favorite Properties
            </h1>
            <p className="text-gray-600">
              You have {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
            </p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="text-blue-600 hover:text-blue-700 font-semibold self-start md:self-auto"
          >
            Browse More →
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        </div>

        {/* Favorites Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredFavorites.map((fav) => {
            const property = fav.property;
            if (!property || !property._id) return null;

            return (
              <div key={fav._id || property._id}>
                <PropertyCard
                  property={property}
                  isFavorite={true}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            );
          })}
        </div>

        {/* No Results After Filtering */}
        {filteredFavorites.length === 0 && favorites.length > 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No favorites match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
