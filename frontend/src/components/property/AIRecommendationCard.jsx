import React, { useMemo, useState } from 'react';
import { FaInfoCircle, FaMagic, FaRobot } from 'react-icons/fa';
import PropertyCard from './PropertyCard';

// AI-signaling card wrapper
// - Reuses existing PropertyCard (no business logic changes)
// - Adds AI overlay: match score, reason tag, confidence cue, and explanation

const AIRecommendationCard = ({ property, ai, isFavorite, onFavoriteToggle }) => {
  const [showWhy, setShowWhy] = useState(false);

  const match = useMemo(() => {
    const v = Number(ai?.matchPercent);
    return Number.isFinite(v) ? v : 0;
  }, [ai?.matchPercent]);

  const cueTone = ai?.cueTone || 'from-blue-600 to-purple-600';
  const cueLabel = ai?.cueLabel || 'Smart Match';

  return (
    <div
      className={
        'group relative rounded-2xl border bg-gradient-to-br from-blue-50/60 via-white to-purple-50/60 p-3 ' +
        'ring-1 ring-blue-200/40 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md'
      }
    >
      {/* AI header overlay */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${cueTone} px-2.5 py-1 text-xs font-semibold text-white`}>
              <FaMagic className="text-[11px]" />
              {cueLabel}
            </span>

            {ai?.preview && (
              <span className="inline-flex items-center rounded-full border border-purple-200 bg-white px-2.5 py-1 text-xs font-semibold text-purple-700">
                Preview
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800">
              <FaRobot className="text-[11px] text-slate-500" />
              <span>{match}% match</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              {ai?.reasonTag || 'Smart Match'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          title={ai?.explanation || 'Why this recommendation?'}
          aria-label="Why this recommendation?"
        >
          <FaInfoCircle className="text-slate-500" />
          Why this?
        </button>
      </div>

      {/* Explanation (expandable) */}
      {showWhy && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {/* AI-signaling explanation text */}
          {ai?.explanation || 'Recommended by a smart match heuristic.'}
        </div>
      )}

      {/* Base property UI */}
      <div className="rounded-xl overflow-hidden">
        <PropertyCard property={property} isFavorite={isFavorite} onFavoriteToggle={onFavoriteToggle} />
      </div>
    </div>
  );
};

export default AIRecommendationCard;
