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

export const buildAiListContext = (properties = []) => {
  const list = Array.isArray(properties) ? properties : [];
  const prices = list
    .map((p) => Number(p?.price?.monthly))
    .filter((n) => Number.isFinite(n) && n > 0);

  const views = list
    .map((p) => Number(p?.views))
    .filter((n) => Number.isFinite(n) && n >= 0);

  const avgPrice = prices.length ? prices.reduce((s, n) => s + n, 0) / prices.length : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const avgViews = views.length ? views.reduce((s, n) => s + n, 0) / views.length : 0;
  const maxViews = views.length ? Math.max(...views) : 0;

  return {
    avgPrice,
    minPrice,
    maxPrice,
    avgViews,
    maxViews,
  };
};

const normalizeFilters = (filters) => {
  const f = filters || {};
  return {
    city: normalizeText(f.city),
    search: normalizeText(f.search),
    propertyType: normalizeText(f.propertyType),
    bedrooms: f.bedrooms ? Number(f.bedrooms) : null,
    bathrooms: f.bathrooms ? Number(f.bathrooms) : null,
    furnished: normalizeText(f.furnished),
    availability: normalizeText(f.availability),
    minPrice: f.minPrice ? Number(f.minPrice) : null,
    maxPrice: f.maxPrice ? Number(f.maxPrice) : null,
  };
};

export const buildAiSignalsForProperty = ({
  property,
  user = null,
  favorites = [],
  lastSearch = null,
  activeFilters = null,
  listContext = null,
  mode = 'auto',
} = {}) => {
  const p = property;
  const favSet = new Set((favorites || []).map((x) => String(x)));
  const search = lastSearch || loadLastSearch();
  const filters = normalizeFilters(activeFilters);

  const searchCity = normalizeText(search?.city);
  const searchQuery = normalizeText(search?.query);
  const hasSearch = Boolean(searchCity || searchQuery);

  const city = normalizeText(p?.address?.city);
  const title = normalizeText(p?.title);
  const desc = normalizeText(p?.description);

  const cityMatch = (filters.city && city === filters.city) || (searchCity && city === searchCity);
  const queryMatch =
    (filters.search && (title.includes(filters.search) || desc.includes(filters.search) || city.includes(filters.search))) ||
    (searchQuery && (title.includes(searchQuery) || desc.includes(searchQuery) || city.includes(searchQuery)));

  const ctx = listContext || buildAiListContext([p]);

  // Backend provides aiLabel (heuristic), but we don’t rely on it existing.
  const aiLabel = String(p?.aiLabel || '').toLowerCase();
  const viewsNum = Number(p?.views) || 0;
  const monthly = Number(p?.price?.monthly) || 0;
  const rating = Number(p?.rating) || 0;

  const isHighDemand = aiLabel.includes('high demand') || (ctx.avgViews > 0 ? viewsNum > ctx.avgViews : viewsNum > 50);
  const isBestValue = aiLabel.includes('best value') || (ctx.avgPrice > 0 && monthly > 0 ? monthly <= 0.85 * ctx.avgPrice : false);
  const isFavorite = favSet.has(String(p?._id));

  // Transparent heuristic score → displayed as “match %”
  // Uses BOTH search intent and active filters as signals, plus lightweight ranking signals.
  let score = 0;
  if (cityMatch) score += 34;
  if (queryMatch) score += 18;
  if (isFavorite) score += 12;

  // Popularity signal (relative)
  if (ctx.maxViews > 0) score += clamp((viewsNum / ctx.maxViews) * 16, 0, 16);
  else if (viewsNum > 0) score += 4;

  // Rating signal
  if (rating > 0) score += clamp((rating / 5) * 18, 0, 18);

  // Value signal (cheaper-than-average gets a boost; expensive gets smaller)
  if (ctx.avgPrice > 0 && monthly > 0) {
    const ratio = monthly / ctx.avgPrice; // 1.0 means average
    // ratio 0.6 => strong boost, ratio 1.4 => minimal boost
    const valueBoost = clamp((1.3 - ratio) * 10, 0, 10);
    score += valueBoost;
  }

  if (isHighDemand) score += 6;
  if (isBestValue) score += 6;

  // Filter-alignment boosters (only if user set those filters)
  if (filters.propertyType && normalizeText(p?.propertyType) === filters.propertyType) score += 6;
  if (Number.isFinite(filters.bedrooms) && (Number(p?.bedrooms) || 0) >= filters.bedrooms) score += 5;
  if (Number.isFinite(filters.bathrooms) && (Number(p?.bathrooms) || 0) >= filters.bathrooms) score += 4;

  // Stable jitter based on id
  const idStr = String(p?._id || '');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) % 97;
  score += hash % 7;

  // Convert raw score to a stable % range with enough spread.
  // (No hard 55% floor unless signals are truly absent.)
  const scorePct = clamp(Math.round(42 + score), 35, 96);
  const cue = pickCue(scorePct);

  const hasActiveFilters = Boolean(
    filters.city ||
      filters.search ||
      filters.propertyType ||
      Number.isFinite(filters.bedrooms) ||
      Number.isFinite(filters.bathrooms) ||
      filters.furnished ||
      filters.availability ||
      Number.isFinite(filters.minPrice) ||
      Number.isFinite(filters.maxPrice)
  );

  const reason = hasActiveFilters
    ? 'Matches your filters'
    : pickReason({ hasSearch, cityMatch, isHighDemand, isBestValue, isFavorite });

  let explanation = 'Recommended by a smart heuristic match (value + popularity signals).';
  if (hasActiveFilters) {
    if (filters.city) {
      explanation = `Recommended because it matches your filter for ${filters.city}.`;
    } else if (filters.search) {
      explanation = 'Recommended because it matches your search filter.';
    } else {
      explanation = 'Recommended because it aligns with your selected filters.';
    }
  } else if (hasSearch && cityMatch) {
    explanation = `Recommended because you viewed or searched similar properties in ${p?.address?.city || 'this city'}.`;
  } else if (hasSearch && queryMatch) {
    explanation = 'Recommended because it matches your recent search intent.';
  } else if (isHighDemand) {
    explanation = 'Recommended because it’s trending based on recent interest.';
  }

  const preview = mode === 'preview' || !user;

  return {
    matchPercent: scorePct,
    reasonTag: reason,
    explanation,
    cueLabel: cue.label,
    cueTone: cue.tone,
    preview,
  };
};

export const buildAiRecommendations = ({
  properties = [],
  user = null,
  favorites = [],
  lastSearch = null,
  activeFilters = null,
  limit = 6,
  mode = 'auto', // 'auto' | 'preview'
} = {}) => {
  const ctx = buildAiListContext(properties);
  const scored = (properties || [])
    .filter(Boolean)
    .map((p) => {
      return {
        property: p,
        ai: buildAiSignalsForProperty({
          property: p,
          user,
          favorites,
          lastSearch,
          activeFilters,
          listContext: ctx,
          mode,
        }),
      };
    })
    .sort((a, b) => (b.ai.matchPercent || 0) - (a.ai.matchPercent || 0));

  return scored.slice(0, Math.max(1, Number(limit) || 6));
};
