import React, { useState } from 'react';
import { FaStar, FaRegStar, FaCheckCircle, FaExclamationCircle, FaPen } from 'react-icons/fa';
import { addReview } from '../../api/reviewService';

const AddReview = ({ propertyId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setError('');
    setSuccess(false);
    setSubmitting(true);

    try {
      await addReview(propertyId, { rating, comment: comment.trim() });
      setComment('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      if (typeof onReviewAdded === 'function') {
        onReviewAdded();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= (hoverRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label={`Rate ${i} stars`}
        >
          {isActive ? (
            <FaStar className="text-yellow-400 text-3xl drop-shadow-sm" />
          ) : (
            <FaRegStar className="text-gray-300 text-3xl hover:text-yellow-200 transition-colors" />
          )}
        </button>
      );
    }
    return stars;
  };

  const getRatingLabel = () => {
    const labels = {
      1: { text: 'Poor', emoji: '😞', color: 'text-red-600' },
      2: { text: 'Fair', emoji: '😐', color: 'text-orange-600' },
      3: { text: 'Good', emoji: '🙂', color: 'text-yellow-600' },
      4: { text: 'Very Good', emoji: '😊', color: 'text-green-600' },
      5: { text: 'Excellent', emoji: '🤩', color: 'text-green-600' }
    };
    return labels[hoverRating || rating];
  };

  const ratingInfo = getRatingLabel();

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FaPen className="text-blue-600 text-xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Add Your Review</h3>
          <p className="text-sm text-gray-600 mt-0.5">Share your experience with others</p>
        </div>
      </div>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 animate-fadeIn">
          <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Review Submitted!</h4>
            <p className="text-green-700 text-sm">Thank you for your feedback. Your review has been published successfully.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-fadeIn">
          <FaExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Submission Failed</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block mb-3 font-semibold text-gray-800 text-lg">
            Rate Your Experience
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2">
              {renderStars()}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg ${ratingInfo.color}`}>
              <span className="text-2xl">{ratingInfo.emoji}</span>
              <span className="font-bold text-lg">
                {ratingInfo.text}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Click on the stars to rate (1 = Poor, 5 = Excellent)
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block mb-3 font-semibold text-gray-800 text-lg">
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError('');
            }}
            required
            rows={6}
            maxLength={1000}
            placeholder="Tell us about your experience... What did you like? What could be improved? How was the property condition, location, landlord response?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition placeholder:text-gray-400"
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              💡 Be specific and honest to help others make informed decisions
            </p>
            <p className={`text-xs font-medium ${
              comment.length > 900 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {comment.length}/1000
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-semibold text-blue-900 mb-2">Review Guidelines:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Minimum 10 characters required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Be respectful and constructive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Focus on your personal experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Avoid offensive language or personal attacks</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !comment.trim() || comment.trim().length < 10}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting Review...</span>
            </>
          ) : (
            <>
              <FaCheckCircle />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </form>

      <style jsx>{`
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddReview;
