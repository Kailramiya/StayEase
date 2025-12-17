import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AIRecommendationCard from '../components/property/AIRecommendationCard';
import { getProperties } from '../api/propertyService';
import { getFavorites } from '../api/favoriteService';
import useAuth from '../hooks/useAuth';
import { FaFilter, FaSearch, FaTimes, FaSortAmountDown } from 'react-icons/fa';
import { buildAiListContext, buildAiSignalsForProperty, loadLastSearch, saveLastSearch } from '../utils/aiRecommendations';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth?.() || {};
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('type') || '',
    priceMin: searchParams.get('minPrice') || '',
    priceMax: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    furnished: searchParams.get('furnished') || '',
    availability: searchParams.get('availability') || '',
  });

  const [sortBy, setSortBy] = useState('recent'); // 'ai', 'recent', 'price-low', 'price-high', 'rating'
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);

  // AI-signaling: attach match/reason/why UI on the list page when AI sort is active.
  // This uses transparent heuristics that incorporate active filters.
  const aiRows = useMemo(() => {
    if (sortBy !== 'ai') return [];
    const lastSearch = loadLastSearch();
    const ctx = buildAiListContext(properties);
    return (properties || []).map((p) => ({
      property: p,
      ai: buildAiSignalsForProperty({
        property: p,
        user,
        favorites,
        lastSearch,
        listContext: ctx,
        activeFilters: {
          search: filters.search,
          city: filters.city,
          propertyType: filters.propertyType,
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
          furnished: filters.furnished,
          availability: filters.availability,
          minPrice: filters.priceMin,
          maxPrice: filters.priceMax,
        },
        mode: user ? 'auto' : 'preview',
      }),
    }));
  }, [favorites, filters, properties, sortBy, user]);

  const fetchProperties = async (pageOverride) => {
    setLoading(true);
    try {
      const currentPage = pageOverride ?? page;
      // Normalize filter keys expected by backend
      const queryFilters = {
        // map client filter keys to backend expected names
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.city ? { city: filters.city } : {}),
        ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
        ...(filters.bedrooms ? { bedrooms: filters.bedrooms } : {}),
        ...(filters.bathrooms ? { bathrooms: filters.bathrooms } : {}),
        ...(filters.furnished ? { furnished: filters.furnished } : {}),
        ...(filters.availability ? { availability: filters.availability } : {}),
        // price field names: backend expects minPrice/maxPrice
        ...(filters.priceMin ? { minPrice: filters.priceMin } : {}),
        ...(filters.priceMax ? { maxPrice: filters.priceMax } : {}),
        page: currentPage,
        limit: 9,
      };
      
      // Add sorting
      switch (sortBy) {
        case 'ai':
          queryFilters.rank = 'ai';
          queryFilters.includeAi = true;
          // In AI rank mode, backend ignores sort; don't send it.
          break;
        case 'price-low':
          queryFilters.rank = 'none';
          queryFilters.includeAi = true;
          queryFilters.sort = 'price.monthly';
          break;
        case 'price-high':
          queryFilters.rank = 'none';
          queryFilters.includeAi = true;
          queryFilters.sort = '-price.monthly';
          break;
        case 'rating':
          queryFilters.rank = 'none';
          queryFilters.includeAi = true;
          queryFilters.sort = '-rating';
          break;
        case 'recent':
        default:
          queryFilters.rank = 'none';
          queryFilters.includeAi = true;
          queryFilters.sort = '-createdAt';
          break;
      }
      
      // Remove empty filters
      Object.keys(queryFilters).forEach(key => {
        if (queryFilters[key] === '' || queryFilters[key] === null || queryFilters[key] === undefined) {
          delete queryFilters[key];
        }
      });

      const data = await getProperties(queryFilters);
      const propertyList = data?.properties || data?.data || data || [];
      setProperties(Array.isArray(propertyList) ? propertyList : []);
      setTotalPages(data?.totalPages || 1);
      setTotalProperties(data?.total || propertyList.length);
      // ensure page state is in sync with the fetch (useful when pageOverride is provided)
      if (page !== currentPage) setPage(currentPage);
    } catch (error) {
      console.error('Failed to fetch properties', error);
      setProperties([]);
      setTotalPages(1);
      setTotalProperties(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    // ensure we have a logged in user
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await getFavorites();
      // support multiple response shapes: res.data.favorites | res.favorites | res (array)
      const list = res?.data?.favorites || res?.favorites || res || [];
      const arr = Array.isArray(list) ? list : [];
      const favIds = arr
        .map((f) => {
          // f could be a string id, an object with property/_id, or an object representing the favorite entry
          if (!f) return null;
          if (typeof f === 'string') return f;
          if (f.property) return String(f.property._id || f.property);
          if (f._id && f.propertyId) return String(f.propertyId);
          if (f.propertyId) return String(f.propertyId);
          // fallback to any id-like field
          return String(f._id || f.id || null);
        })
        .filter(Boolean);
      setFavorites(favIds);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
      setFavorites([]);
    }
  };
  
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy]);

  useEffect(() => {
    // fetch favorites when user changes and also refetch after properties load
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, properties.length]);
  
  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e?.preventDefault();

    // AI-signaling: persist intent so “Why this?” can reference it.
    saveLastSearch({ city: filters.city, query: filters.search });

    // reset to first page and fetch with the updated search term
    setPage(1);
    fetchProperties(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      city: '',
      propertyType: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      furnished: '',
      availability: '',
    });
    setPage(1);
    // Trigger fetch after clearing
    setTimeout(() => {
      fetchProperties();
    }, 100);
  };

  const handleFavoriteToggle = (propertyId, isFavorite) => {
    const id = String(propertyId);
    if (isFavorite) {
      setFavorites((prev) => Array.from(new Set([...prev, id])));
    } else {
      setFavorites((prev) => prev.filter((pid) => String(pid) !== id));
    }
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Properties</h1>
          <p className="text-gray-600">
            {totalProperties} {totalProperties === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <FaTimes />
                Clear All
              </button>
            )}
          </div>

          <form onSubmit={handleSearch}>
            {/* Search Bar - Always Visible */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by title, city, or location..."
                  value={filters.search}
                  onChange={handleInputChange}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaSearch />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Type</label>
                    <select
                      name="propertyType"
                      value={filters.propertyType}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="studio">Studio</option>
                      <option value="pg">PG</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Min Price (₹)</label>
                    <input
                      type="number"
                      name="priceMin"
                      placeholder="e.g. 10000"
                      value={filters.priceMin}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Max Price (₹)</label>
                    <input
                      type="number"
                      name="priceMax"
                      placeholder="e.g. 50000"
                      value={filters.priceMax}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bedrooms</label>
                    <select
                      name="bedrooms"
                      value={filters.bedrooms}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bathrooms</label>
                    <select
                      name="bathrooms"
                      value={filters.bathrooms}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Furnished</label>
                    <select
                      name="furnished"
                      value={filters.furnished}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Any</option>
                      <option value="fully-furnished">Fully Furnished</option>
                      <option value="semi-furnished">Semi Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Availability</label>
                    <select
                      name="availability"
                      value={filters.availability}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Any</option>
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sort and Results Bar */}
        {!loading && properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-700">
              Showing <span className="font-semibold">{properties.length}</span> of <span className="font-semibold">{totalProperties}</span> properties
            </p>
            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ai">AI Recommended</option>
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        )}

        {/* Property List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <FaSearch />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters, changing the city, or searching with different keywords.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={() => fetchProperties(1)}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Refresh
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {sortBy === 'ai' && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50 p-4">
                <p className="text-sm font-semibold text-slate-900">AI ranking is active</p>
                <p className="mt-1 text-sm text-slate-600">
                  Results are scored against your current filters. Open “Why this?” on any card to see the explanation.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortBy === 'ai'
                ? aiRows.map(({ property, ai }) => (
                    <AIRecommendationCard
                      key={property._id}
                      property={property}
                      ai={ai}
                      isFavorite={favorites.includes(String(property._id))}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))
                : properties.map((property) => (
                    <AIRecommendationCard
                      key={property._id}
                      property={property}
                      ai={buildAiSignalsForProperty({
                        property,
                        user,
                        favorites,
                        lastSearch: loadLastSearch(),
                        activeFilters: {
                          search: filters.search,
                          city: filters.city,
                          propertyType: filters.propertyType,
                          bedrooms: filters.bedrooms,
                          bathrooms: filters.bathrooms,
                          furnished: filters.furnished,
                          availability: filters.availability,
                          minPrice: filters.priceMin,
                          maxPrice: filters.priceMax,
                        },
                        mode: user ? 'auto' : 'preview',
                      })}
                      isFavorite={favorites.includes(String(property._id))}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return <span key={pageNum} className="px-2 py-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                  >
                    Next
                  </button>
                </div>

                <p className="text-sm text-gray-600 hidden sm:block">
                  {/* Spacer for layout */}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
