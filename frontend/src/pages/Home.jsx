import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/property/PropertyCard';
import { 
  FaSearch, 
  FaHome, 
  FaShieldAlt, 
  FaMoneyBillWave, 
  FaUsers,
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import api from '../api/api';
import { getFavorites } from '../api/favoriteService';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalBookings: 0,
  });
  const navigate = useNavigate();
  const { user } = useAuth?.() || {};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch featured/recent properties
        const { data } = await api.get('/properties?limit=6&sort=-createdAt');
        const properties = data.data || data.properties || data || [];
        setFeaturedProperties(Array.isArray(properties) ? properties : []);

        // You can also fetch stats from admin API if available
        // const statsData = await api.get('/admin/stats');
        // setStats(statsData.data);

        // Fetch favorites if user is logged in
        if (user) {
          try {
            const favData = await getFavorites();
            // Support multiple response shapes: array, { favorites: [...] }, { data: [...] }
            const list = favData?.data?.favorites || favData?.favorites || favData || [];
            const arr = Array.isArray(list) ? list : [];
            const favIds = arr
              .map((f) => {
                if (!f) return null;
                if (typeof f === 'string') return f;
                if (f.property) return String(f.property._id || f.property);
                if (f.propertyId) return String(f.propertyId);
                return String(f._id || f.id || null);
              })
              .filter(Boolean);
            setFavorites(favIds);
          } catch (error) {
            console.error('Failed to fetch favorites', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (searchCity.trim()) {
      params.append('city', searchCity.trim());
    }
    
    if (params.toString()) {
      navigate(`/properties?${params.toString()}`);
    } else {
      navigate('/properties');
    }
  };

  const handleFavoriteToggle = (propertyId, isFavorite) => {
    if (isFavorite) {
      setFavorites((prev) => [...prev, propertyId]);
    } else {
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
    }
  };

  const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];

  const propertyTypes = [
    { type: 'Apartment', emoji: '🏢' },
    { type: 'House', emoji: '🏠' },
    { type: 'Villa', emoji: '🏡' },
    { type: 'Studio', emoji: '🏘️' },
    { type: 'PG', emoji: '🏨' },
    { type: 'Hostel', emoji: '🏫' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      city: 'Mumbai',
      rating: 5,
      text: 'Found my dream apartment within days! The process was smooth and hassle-free.',
    },
    {
      name: 'Rahul Verma',
      city: 'Bangalore',
      rating: 5,
      text: 'Great platform with verified properties. Saved me so much time and effort.',
    },
    {
      name: 'Anita Desai',
      city: 'Delhi',
      rating: 5,
      text: 'Excellent customer support and transparent pricing. Highly recommended!',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-24 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
              Find Your Perfect Monthly Rental
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Affordable, verified, and flexible rentals across India 🏠
            </p>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl p-2 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 border-r border-gray-200">
                  <FaSearch className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search property, locality..."
                    className="flex-1 py-3 text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="flex-1 flex items-center px-4">
                  <FaMapMarkerAlt className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="City"
                    className="flex-1 py-3 text-gray-900 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <FaSearch />
                  Search
                </button>
              </div>
            </form>

            {/* Popular Cities */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-blue-100 text-sm">Popular:</span>
              {popularCities.map((city) => (
                <button
                  key={city}
                  onClick={() => navigate(`/properties?city=${city}`)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1 rounded-full text-sm transition"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">{featuredProperties.length}+</p>
              <p className="text-gray-600 mt-1">Properties Listed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">1000+</p>
              <p className="text-gray-600 mt-1">Happy Tenants</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">50+</p>
              <p className="text-gray-600 mt-1">Cities Covered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-600">4.8★</p>
              <p className="text-gray-600 mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose StayEase?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We make finding and renting properties simple, secure, and hassle-free
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <FaHome className="text-white text-3xl" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-center">Wide Selection</h3>
              <p className="text-gray-600 text-center">Thousands of verified properties across India</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-center">100% Verified</h3>
              <p className="text-gray-600 text-center">All listings are verified for authenticity & safety</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <FaMoneyBillWave className="text-white text-3xl" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-center">Best Prices</h3>
              <p className="text-gray-600 text-center">Competitive monthly rental rates with no hidden fees</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-center">Trusted Platform</h3>
              <p className="text-gray-600 text-center">Join thousands of satisfied tenants nationwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">Featured Properties</h2>
              <p className="text-gray-600">Handpicked properties just for you</p>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              View All
              <span>→</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FaHome className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No properties available at the moment.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isFavorite={favorites.includes(property._id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Browse by Property Type</h2>
          <p className="text-center text-gray-600 mb-12">Find the perfect space that matches your lifestyle</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {propertyTypes.map(({ type, emoji }) => (
              <button
                key={type}
                onClick={() => navigate(`/properties?type=${type.toLowerCase()}`)}
                className="bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 text-center transition transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-lg">{type}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12">Get started in just 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                1
              </div>
              <h3 className="font-semibold text-xl mb-2">Search & Browse</h3>
              <p className="text-gray-600">Find properties that match your preferences and budget</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                2
              </div>
              <h3 className="font-semibold text-xl mb-2">Schedule Visit</h3>
              <p className="text-gray-600">Book a viewing and inspect the property in person</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                3
              </div>
              <h3 className="font-semibold text-xl mb-2">Move In</h3>
              <p className="text-gray-600">Complete the booking and start your stay hassle-free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Find Your Next Home?</h2>
          <p className="text-xl mb-8 text-purple-100">Join thousands of happy tenants today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/properties')}
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-xl"
            >
              Explore Properties
            </button>
            {!user && (
              <button
                onClick={() => navigate('/register')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition"
              >
                Sign Up Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Tenants Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
