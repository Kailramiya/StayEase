import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AIRecommendationCard from '../components/property/AIRecommendationCard';
import AIRecommendationsSection from '../components/property/AIRecommendationsSection';
import api from '../api/api';
import { getFavorites } from '../api/favoriteService';
import useAuth from '../hooks/useAuth';
import {
  buildAiListContext,
  buildAiRecommendations,
  buildAiSignalsForProperty,
  loadLastSearch,
  saveLastSearch,
} from '../utils/aiRecommendations';

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
          api.get('/properties?limit=6&sort=-createdAt&rank=none&includeAi=true'),
          // Trending: most viewed
          api.get('/properties?limit=12&sort=-views&rank=none&includeAi=true'),
        ]);

        setRecentProperties(extractProperties(recentRes));
        setTrendingProperties(extractProperties(trendingRes));

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

  const recentCtx = useMemo(() => buildAiListContext(visibleRecent), [visibleRecent]);
  const trendingCtx = useMemo(() => buildAiListContext(visibleTrending), [visibleTrending]);

  const lastSearch = useMemo(() => loadLastSearch(), []);

  // AI-signaling: simulate personalized recommendations from existing data (no new backend APIs)
  const aiRecommendations = useMemo(() => {
    const pool = [...(trendingProperties || []), ...(recentProperties || [])];
    const byId = new Map();
    for (const p of pool) {
      if (p && p._id && !byId.has(String(p._id))) byId.set(String(p._id), p);
    }

    return buildAiRecommendations({
      properties: Array.from(byId.values()),
      user,
      favorites,
      lastSearch,
      limit: 6,
      mode: user ? 'auto' : 'preview',
    });
  }, [favorites, lastSearch, recentProperties, trendingProperties, user]);

  const handleSearch = (e) => {
    e.preventDefault();

    // AI-signaling: remember last intent (used to explain recommendations)
    saveLastSearch({ city: searchCity, query: searchQuery });

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-3 py-1 text-sm font-semibold text-indigo-700">
              Monthly rentals
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
              Find a rental that fits your month.
            </h1>
            <p className="mt-3 text-base md:text-lg text-slate-600">
              Search listings by city and keyword, then book directly from the details page.
            </p>

            <form onSubmit={handleSearch} className="mt-10">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-indigo-500/30">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, area, or keyword"
                      className="w-full py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-indigo-500/30">
                    <input
                      type="text"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      placeholder="City"
                      className="w-full py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                  >
                    Find stays
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* AI RECOMMENDATION SECTION */}
      <AIRecommendationsSection
        recommendations={aiRecommendations}
        loading={loading}
        user={user}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Features Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">How it works</h2>
            <p className="mt-2 text-slate-600">Simple flow, clear details, and bookings tracked in your account.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Search</h3>
              <p className="mt-2 text-sm text-slate-600">Use keyword + city to narrow down the right options fast.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Book</h3>
              <p className="mt-2 text-sm text-slate-600">Review photos and details, then confirm and manage bookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Data Section */}
      <section className="border-t border-slate-200/70 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                {user ? 'What our AI thinks you’ll like' : 'AI-flavored picks'}
              </h2>
              <p className="mt-2 text-slate-600">
                {user
                  ? 'Personalized tone with transparent signals (still heuristic-based).' 
                  : 'Sign in for true personalization — preview uses demo signals.'}
              </p>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              See all →
            </Link>
          </div>

          {trendingLocations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">Trending locations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {trendingLocations.map((city) => (
                  <Link
                    key={city}
                    to={`/properties?city=${encodeURIComponent(city)}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700"
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
                <h3 className="text-lg font-semibold text-slate-900">Fresh picks</h3>
                <Link
                  to="/properties?sort=-createdAt"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  More
                </Link>
              </div>
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading…</div>
              ) : visibleRecent.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No recent stays yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {visibleRecent.map((property) => (
                    <AIRecommendationCard
                      key={property._id}
                      property={property}
                      ai={buildAiSignalsForProperty({
                        property,
                        user,
                        favorites,
                        lastSearch,
                        listContext: recentCtx,
                        mode: user ? 'auto' : 'preview',
                      })}
                      isFavorite={favorites.includes(String(property._id))}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Trending prediction</h3>
                <Link to="/properties?sort=-views" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  More
                </Link>
              </div>
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading…</div>
              ) : visibleTrending.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No trending stays yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {visibleTrending.map((property) => (
                    <AIRecommendationCard
                      key={property._id}
                      property={property}
                      ai={buildAiSignalsForProperty({
                        property,
                        user,
                        favorites,
                        lastSearch,
                        listContext: trendingCtx,
                        mode: user ? 'auto' : 'preview',
                      })}
                      isFavorite={favorites.includes(String(property._id))}
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
