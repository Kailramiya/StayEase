// AI-signaling utilities (frontend-only)
//
// IMPORTANT:
// - This project does NOT run an ML model or call an LLM here.
// - These functions simulate “AI recommendations” using transparent heuristics
//   (recent search intent + popularity/value signals + lightweight scoring).
// - This keeps the UI honest while still looking “AI-powered”.

const STORAGE_KEY = 'stayease:lastSearch';

export const saveLastSearch = ({ city = '', query = '' } = {}) => {
  try {
    const payload = {
      city: String(city || '').trim(),
      query: String(query || '').trim(),
      at: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

export const loadLastSearch = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { city: '', query: '', at: 0 };
    const parsed = JSON.parse(raw);
    return {
      city: String(parsed?.city || '').trim(),
      query: String(parsed?.query || '').trim(),
      at: Number(parsed?.at || 0),
    };
  } catch {
    return { city: '', query: '', at: 0 };
  }
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const normalizeText = (v) => String(v || '').trim().toLowerCase();

const pickReason = ({ hasSearch, cityMatch, isHighDemand, isBestValue, isFavorite }) => {
  // Keep reasons user-facing and “AI-like” but honest (heuristics).
  if (isFavorite) return 'Because you favorited similar homes';
  if (hasSearch && cityMatch) return 'Based on your searches';
  if (isHighDemand) return 'Popular with similar users';
  if (isBestValue) return 'Great value for your budget';
  return 'Smart Match';
};

const pickCue = (scorePct) => {
  if (scorePct >= 85) return { label: 'High Confidence ✨', tone: 'from-blue-600 to-purple-600' };
  if (scorePct >= 72) return { label: 'Smart Match 🤖', tone: 'from-indigo-600 to-blue-600' };
  return { label: 'Trending Prediction 📊', tone: 'from-purple-600 to-indigo-600' };
};

export const buildAiRecommendations = ({
  properties = [],
  user = null,
  favorites = [],
  lastSearch = null,
  limit = 6,
  mode = 'auto', // 'auto' | 'preview'
} = {}) => {
  const favSet = new Set((favorites || []).map((x) => String(x)));
  const search = lastSearch || loadLastSearch();

  const searchCity = normalizeText(search?.city);
  const searchQuery = normalizeText(search?.query);
  const hasSearch = Boolean(searchCity || searchQuery);

  const scored = (properties || [])
    .filter(Boolean)
    .map((p) => {
      const city = normalizeText(p?.address?.city);
      const title = normalizeText(p?.title);
      const desc = normalizeText(p?.description);

      const cityMatch = searchCity && city === searchCity;
      const queryMatch = searchQuery && (title.includes(searchQuery) || desc.includes(searchQuery) || city.includes(searchQuery));

      // Backend provides aiLabel (heuristic), but we don’t rely on it existing.
      const aiLabel = String(p?.aiLabel || '').toLowerCase();
      const isHighDemand = aiLabel.includes('high demand') || (Number(p?.views) || 0) > 50;
      const isBestValue = aiLabel.includes('best value') || (Number(p?.price?.monthly) || 0) > 0;

      const isFavorite = favSet.has(String(p?._id));

      // Transparent heuristic score → displayed as “match %”
      // Weighted for intent match + light popularity/value signals.
      let score = 0;
      if (cityMatch) score += 42;
      if (queryMatch) score += 24;
      if (isFavorite) score += 16;
      if (isHighDemand) score += 10;
      if (isBestValue) score += 8;

      // Add a small deterministic jitter based on id (stable across renders)
      const idStr = String(p?._id || '');
      let hash = 0;
      for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) % 97;
      score += hash % 7; // 0..6

      const scorePct = clamp(Math.round(score), 55, 96);
      const cue = pickCue(scorePct);
      const reason = pickReason({ hasSearch, cityMatch, isHighDemand, isBestValue, isFavorite });

      const explanation = hasSearch && cityMatch
        ? `Recommended because you searched for places in ${p?.address?.city || 'this city'}.`
        : hasSearch && queryMatch
          ? 'Recommended because it matches your recent search intent.'
          : isHighDemand
            ? 'Recommended because it’s trending based on recent interest.'
            : 'Recommended by a smart heuristic match (value + popularity signals).';

      const preview = mode === 'preview' || !user;

      return {
        property: p,
        ai: {
          matchPercent: scorePct,
          reasonTag: reason,
          explanation,
          cueLabel: cue.label,
          cueTone: cue.tone,
          preview,
        },
      };
    })
    .sort((a, b) => (b.ai.matchPercent || 0) - (a.ai.matchPercent || 0));

  return scored.slice(0, Math.max(1, Number(limit) || 6));
};
