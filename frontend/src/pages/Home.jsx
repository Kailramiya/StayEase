import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/property/PropertyCard';
import { 
  FaHome,
} from 'react-icons/fa';
import api from '../api/api';
import { getFavorites } from '../api/favoriteService';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const [recentProperties, setRecentProperties] = useState([]);
  const [trendingProperties, setTrendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth?.() || {};

  const extractProperties = (payload) => {
    const data = payload?.data;
    const properties = data?.data || data?.properties || data;
    return Array.isArray(properties) ? properties : [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recentRes, trendingRes] = await Promise.all([
          // Recently added: ensure traditional sorting works
          api.get('/properties?limit=6&sort=-createdAt&rank=none'),
          // Trending: most viewed
          api.get('/properties?limit=12&sort=-views&rank=none'),
        ]);

        setRecentProperties(extractProperties(recentRes));
        setTrendingProperties(extractProperties(trendingRes));

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

  const trendingLocations = useMemo(() => {
    const counts = new Map();
    for (const property of trendingProperties) {
      const city = property?.address?.city;
      if (!city) continue;
      counts.set(city, (counts.get(city) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city]) => city);
  }, [trendingProperties]);

  const visibleRecent = useMemo(() => (recentProperties || []).slice(0, 6), [recentProperties]);
  const visibleTrending = useMemo(() => (trendingProperties || []).slice(0, 6), [trendingProperties]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
              Find a monthly rental that works for you.
            </h1>
            <p className="mt-3 text-base md:text-lg text-gray-600">
              Search listings, check details, and book from one place.
            </p>

            <form onSubmit={handleSearch} className="mt-8">
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 flex items-center px-3 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, area, or keyword"
                      className="flex-1 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex items-center px-3 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      type="text"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      placeholder="City"
                      className="flex-1 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    Find stays
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">How it works</h2>
            <p className="mt-2 text-gray-600">Search → open details → book. Keep everything in your account.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900">Search</h3>
              <p className="mt-1 text-sm text-gray-600">Filter by city and basics to get a short list.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Book</h3>
              <p className="mt-1 text-sm text-gray-600">Confirm the booking and track it from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Data Section */}
      <section className="py-14 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Explore</h2>
              <p className="mt-2 text-gray-600">
                These sections update based on real listings and real views.
              </p>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              See all →
            </Link>
          </div>

          {trendingLocations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900">Trending locations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {trendingLocations.map((city) => (
                  <Link
                    key={city}
                    to={`/properties?city=${encodeURIComponent(city)}`}
                    className="px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recently added</h3>
                <Link
                  to="/properties?sort=-createdAt"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  More
                </Link>
              </div>
              {loading ? (
                <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-600">Loading…</div>
              ) : visibleRecent.length === 0 ? (
                <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-600">No recent stays yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {visibleRecent.map((property) => (
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trending now</h3>
                <Link to="/properties?sort=-views" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  More
                </Link>
              </div>
              {loading ? (
                <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-600">Loading…</div>
              ) : visibleTrending.length === 0 ? (
                <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-600">No trending stays yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {visibleTrending.map((property) => (
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
