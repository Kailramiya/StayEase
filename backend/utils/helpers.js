const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500) => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

const clamp01 = (n) => {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
};

/**
 * Calculate a deterministic ranking score for a property.
 *
 * Components (each normalized to 0..1):
 * - ratingScore: based on rating on a 0..5 scale
 * - priceScore: cheaper properties score higher
 * - demandScore: uses views and bookingsCount
 * - availabilityScore: based on availability status
 *
 * Weights:
 * - rating 35%, price 25%, demand 25%, availability 15%
 *
 * Returns an integer score in the range 0..100.
 */
const calculateScore = (property, context = {}) => {
  const ratingRaw = Number(property?.rating);
  const ratingScore = clamp01((Number.isFinite(ratingRaw) ? ratingRaw : 0) / 5);

  const monthlyPrice = Number(property?.price?.monthly ?? property?.monthlyPrice ?? property?.price);
  const priceValue = Number.isFinite(monthlyPrice) && monthlyPrice > 0 ? monthlyPrice : null;

  // Price scoring (higher score = cheaper)
  // If context provides a range, normalize within it. Otherwise use a deterministic reference curve.
  const minPrice = Number(context?.minPrice);
  const maxPrice = Number(context?.maxPrice);
  const referencePrice = Number(context?.referencePrice);

  let priceScore = 0.5;
  if (priceValue !== null && Number.isFinite(minPrice) && Number.isFinite(maxPrice) && maxPrice > minPrice) {
    priceScore = clamp01(1 - (priceValue - minPrice) / (maxPrice - minPrice));
  } else if (priceValue !== null && Number.isFinite(referencePrice) && referencePrice > 0) {
    // Smooth inverse curve: price==reference => 0.5, cheaper => closer to 1, expensive => closer to 0
    priceScore = clamp01(referencePrice / (priceValue + referencePrice));
  } else if (priceValue !== null) {
    // Deterministic fallback reference (can be overridden by context.referencePrice)
    const defaultRef = 50000;
    priceScore = clamp01(defaultRef / (priceValue + defaultRef));
  }

  // Demand scoring (views + bookingsCount), with log normalization to keep outliers stable.
  const views = Math.max(0, Number(property?.views) || 0);
  const bookingsCount = Math.max(0, Number(property?.bookingsCount) || 0);
  const maxViews = Math.max(1, Number(context?.maxViews) || 1000);
  const maxBookingsCount = Math.max(1, Number(context?.maxBookingsCount) || 50);

  const viewsScore = clamp01(Math.log1p(views) / Math.log1p(maxViews));
  const bookingsScore = clamp01(Math.log1p(bookingsCount) / Math.log1p(maxBookingsCount));
  const demandScore = clamp01((viewsScore + bookingsScore) / 2);

  // Availability scoring
  const availability = String(property?.availability || '').toLowerCase();
  const availabilityScore = clamp01(
    availability === 'available'
      ? 1
      : availability === 'maintenance'
        ? 0.5
        : availability === 'booked'
          ? 0
          : 0.5
  );

  const combined =
    ratingScore * 0.35 +
    priceScore * 0.25 +
    demandScore * 0.25 +
    availabilityScore * 0.15;

  return Math.round(clamp01(combined) * 100);
};

module.exports = {
  successResponse,
  errorResponse,
  calculateScore,
};
