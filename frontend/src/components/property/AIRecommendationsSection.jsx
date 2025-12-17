import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaMagic } from 'react-icons/fa';
import AIRecommendationCard from './AIRecommendationCard';

// AI RECOMMENDATION SECTION (frontend-only)
// - Uses heuristic scoring to simulate personalized AI signals
// - Never calls a new backend “AI endpoint” (per project constraint)

const AIRecommendationsSection = ({
  recommendations = [],
  loading = false,
  user = null,
  onFavoriteToggle,
  favorites = [],
}) => {
  const hasUser = Boolean(user);

  const title = useMemo(() => (hasUser ? 'AI Recommended for You' : 'AI Recommended for You'), [hasUser]);

  const subtitle = useMemo(() => {
    if (hasUser) return 'What our AI thinks you’ll like based on your recent signals.';
    return 'Sign in to unlock personalized AI recommendations. You can preview how it works below.';
  }, [hasUser]);

  return (
    <section className="border-t border-slate-200/70 bg-gradient-to-b from-white via-blue-50/30 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8 shadow-sm ring-1 ring-blue-200/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-semibold text-blue-700">
                <FaRobot className="text-base" />
                {title}
                <span className="text-blue-300">•</span>
                <span className="inline-flex items-center gap-1 text-blue-600">
                  <FaMagic className="text-[13px]" />
                  Smart signals
                </span>
              </div>
              <p className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                {hasUser ? 'Predicted stays for you' : 'Preview AI suggestions'}
              </p>
              <p className="mt-2 text-slate-600">{subtitle}</p>
            </div>

            <Link
              to="/properties"
              className="hidden sm:inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Browse all
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Loading AI recommendations…
              </div>
            ) : recommendations.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                No recommendations available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map(({ property, ai }) => (
                  <AIRecommendationCard
                    key={property._id}
                    property={property}
                    ai={ai}
                    isFavorite={favorites.includes(String(property._id))}
                    onFavoriteToggle={onFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              to="/properties"
              className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Browse all
            </Link>
          </div>

          {/* AI-signaling note (transparent) */}
          <p className="mt-6 text-xs text-slate-500">
            AI signals shown here are heuristic-based (intent + popularity + value) for demo purposes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendationsSection;
