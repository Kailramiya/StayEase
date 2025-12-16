import React, { useEffect, useState } from 'react';
import { 
  FaStar, 
  FaRegStar, 
  FaStarHalfAlt, 
  FaUser, 
  FaThumbsUp,
  FaQuoteLeft,
  FaChartBar,
  FaCalendarAlt,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import { getReviewsByProperty } from '../../api/reviewService';

const ReviewList = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const normalizeReviewsPayload = (payload) => {
    // Backend typically returns: { success, count, data: Review[] }
    // But be tolerant to nesting variations or pagination wrappers.
    if (Array.isArray(payload)) return payload;

    const candidates = [
      payload?.data?.data,
      payload?.data?.reviews,
      payload?.data,
      payload?.reviews,
      payload,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }

    return [];
  };

  const toNumberOrZero = (value) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getReviewsByProperty(propertyId);
        const validReviews = normalizeReviewsPayload(data);
        setReviews(validReviews);
        setFilteredReviews(validReviews);

        // Calculate statistics
        if (validReviews.length > 0) {
          const total = validReviews.length;
          const sum = validReviews.reduce((acc, r) => acc + toNumberOrZero(r.rating), 0);
          const avg = sum / total;

          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          validReviews.forEach((r) => {
            const rating = Math.floor(toNumberOrZero(r.rating));
            if (rating >= 1 && rating <= 5) {
              distribution[rating]++;
            }
          });

          setStats({
            averageRating: avg,
            totalReviews: total,
            ratingDistribution: distribution
          });
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchReviews();
  }, [propertyId]);

  // Filter and sort reviews
  useEffect(() => {
    let result = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      const targetRating = parseInt(filterRating);
      result = result.filter((r) => Math.floor(toNumberOrZero(r.rating)) === targetRating);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'highest') {
        return toNumberOrZero(b.rating) - toNumberOrZero(a.rating);
      } else if (sortBy === 'lowest') {
        return toNumberOrZero(a.rating) - toNumberOrZero(b.rating);
      }
      return 0;
    });

    setFilteredReviews(result);
  }, [reviews, filterRating, sortBy]);

  const renderStars = (rating, size = 'base') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const sizeClass = size === 'large' ? 'text-xl' : size === 'small' ? 'text-sm' : 'text-base';

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className={`text-yellow-400 ${sizeClass}`} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className={`text-yellow-400 ${sizeClass}`} />);
      } else {
        stars.push(<FaRegStar key={i} className={`text-gray-300 ${sizeClass}`} />);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const getPercentage = (count) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (rating >= 4) return { text: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (rating >= 3) return { text: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (rating >= 2) return { text: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getUserInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading reviews...</p>
      </div>
    );
  }

  const avgLabel = getRatingLabel(stats.averageRating);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats.totalReviews > 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaChartBar className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Rating Overview</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="inline-flex flex-col items-center md:items-start gap-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-400 font-medium mb-2">/ 5.0</span>
                </div>
                {renderStars(stats.averageRating, 'large')}
                <div className={`px-3 py-1.5 ${avgLabel.bg} rounded-full mt-2`}>
                  <span className={`text-sm font-semibold ${avgLabel.color}`}>
                    {avgLabel.text}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <FaThumbsUp className="inline mr-1 text-blue-600" />
                  {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">Rating Distribution</p>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star];
                const percentage = getPercentage(count);
                return (
                  <div key={star} className="flex items-center gap-3 group">
                    <button
                      onClick={() => setFilterRating(star.toString())}
                      className="flex items-center gap-1.5 text-sm font-medium w-16 hover:text-blue-600 transition"
                    >
                      <span>{star}</span>
                      <FaStar className="text-yellow-400 text-xs" />
                    </button>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-500 group-hover:from-yellow-500 group-hover:to-yellow-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', '5', '4', '3', '2', '1'].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filterRating === rating
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {rating === 'all' ? 'All' : `${rating} ⭐`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FaSort className="text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FaStar className="text-gray-300 text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {filterRating !== 'all' ? 'No reviews found' : 'No reviews yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filterRating !== 'all' 
              ? `No ${filterRating}-star reviews available. Try changing the filter.`
              : 'Be the first to share your experience!'
            }
          </p>
          {filterRating !== 'all' && (
            <button
              onClick={() => setFilterRating('all')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Show All Reviews
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {filterRating === 'all' ? 'All Reviews' : `${filterRating}-Star Reviews`}
              <span className="text-gray-500 font-normal text-base ml-2">
                ({filteredReviews.length})
              </span>
            </h3>
          </div>

          {filteredReviews.map((review, index) => {
            const numericRating = toNumberOrZero(review.rating);
            const reviewLabel = getRatingLabel(numericRating);
            return (
              <div
                key={review._id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                    {getUserInitials(review.user?.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg text-gray-800 truncate">
                          {review.user?.name || 'Anonymous User'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          <span>{getTimeAgo(review.createdAt)}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`flex flex-col items-end gap-2 flex-shrink-0`}>
                        {renderStars(numericRating)}
                        <div className={`px-3 py-1 ${reviewLabel.bg} rounded-full`}>
                          <span className={`text-xs font-bold ${reviewLabel.color}`}>
                            {numericRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <div className="relative">
                      <FaQuoteLeft className="absolute -left-2 -top-2 text-blue-200 text-2xl opacity-50" />
                      <p className="text-gray-700 leading-relaxed pl-6 text-base">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>

                    {/* Helpful Section (Optional) */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Was this review helpful?</span>
                      <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
                        <FaThumbsUp className="text-xs" />
                        <span>Yes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ReviewList;
