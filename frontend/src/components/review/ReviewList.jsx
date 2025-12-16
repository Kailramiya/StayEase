import React, { useEffect, useState } from 'react';
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaThumbsUp,
  FaQuoteLeft,
  FaChartBar,
  FaCalendarAlt,
  FaFilter,
  FaSort,
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
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  /* ---------------- Utils ---------------- */

  const normalizeReviewsPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    return (
      payload?.data?.data ||
      payload?.data?.reviews ||
      payload?.data ||
      payload?.reviews ||
      []
    );
  };

  const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    const units = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ];
    for (const [u, s] of units) {
      const i = Math.floor(seconds / s);
      if (i >= 1) return `${i} ${u}${i > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  const getUserInitials = (name) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await getReviewsByProperty(propertyId);
        const list = normalizeReviewsPayload(res);
        setReviews(list);
        setFilteredReviews(list);

        if (list.length) {
          const total = list.length;
          const sum = list.reduce((a, r) => a + toNumber(r.rating), 0);
          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          list.forEach((r) => {
            const v = Math.floor(toNumber(r.rating));
            if (dist[v] !== undefined) dist[v]++;
          });

          setStats({
            averageRating: sum / total,
            totalReviews: total,
            ratingDistribution: dist,
          });
        }
      } catch (e) {
        console.error(e);
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchReviews();
  }, [propertyId]);

  useEffect(() => {
    let list = [...reviews];

    if (filterRating !== 'all') {
      list = list.filter(
        (r) => Math.floor(toNumber(r.rating)) === Number(filterRating)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return toNumber(b.rating) - toNumber(a.rating);
      if (sortBy === 'lowest') return toNumber(a.rating) - toNumber(b.rating);
      return 0;
    });

    setFilteredReviews(list);
  }, [reviews, filterRating, sortBy]);

  /* ---------------- Render helpers ---------------- */

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) =>
          i <= full ? (
            <FaStar key={i} className="text-yellow-400" />
          ) : i === full + 1 && half ? (
            <FaStarHalfAlt key={i} className="text-yellow-400" />
          ) : (
            <FaRegStar key={i} className="text-gray-300" />
          )
        )}
      </div>
    );
  };

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-xl">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full mb-3" />
        <p className="text-gray-600">Loading reviews…</p>
      </div>
    );
  }

  /* ---------------- MAIN RETURN ---------------- */

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      {/* Summary */}
      {stats.totalReviews > 0 && (
        <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaChartBar className="text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              Rating overview
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <div className="text-5xl font-bold text-gray-800">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(stats.averageRating)}
              <p className="text-sm text-gray-600 mt-1">
                {stats.totalReviews} reviews
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((s) => {
                const pct =
                  stats.totalReviews === 0
                    ? 0
                    : Math.round(
                        (stats.ratingDistribution[s] /
                          stats.totalReviews) *
                          100
                      );
                return (
                  <div key={s} className="flex items-center gap-2">
                    <button
                      onClick={() => setFilterRating(String(s))}
                      className="text-sm w-8 text-right hover:text-blue-600"
                    >
                      {s}★
                    </button>
                    <div className="flex-1 bg-gray-200 h-2 rounded">
                      <div
                        className="bg-yellow-400 h-2 rounded"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {reviews.length > 0 && (
        <div className="w-full flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
          <FaFilter className="text-gray-500" />
          {['all', '5', '4', '3', '2', '1'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              className={`px-3 py-1 rounded text-sm ${
                filterRating === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              {r === 'all' ? 'All' : `${r}★`}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <FaSort className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews */}
      {filteredReviews.length === 0 ? (
        <div className="w-full text-center py-12 bg-gray-50 rounded-xl border">
          <p className="text-gray-600">No reviews available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="w-full bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {getUserInitials(review.user?.name)}
                </div>

                <div className="w-full min-w-0">
                  <div className="flex justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 truncate">
                        {review.user?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FaCalendarAlt />
                        {getTimeAgo(review.createdAt)}
                      </p>
                    </div>
                    {renderStars(toNumber(review.rating))}
                  </div>

                  <div className="relative">
                    <FaQuoteLeft className="absolute -left-2 -top-1 text-blue-200" />
                    <p className="pl-5 text-gray-700 break-words">
                      {review.comment?.trim() ||
                        'No detailed comment provided.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                    <FaThumbsUp />
                    Helpful
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
