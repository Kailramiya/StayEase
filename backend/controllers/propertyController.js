const Property = require('../models/Property');
const Review = require('../models/Review');
const cloudinary = require('../config/cloudinary');
const { getOrSetCache, invalidateByPrefix } = require('../utils/cache');
const { calculateScore } = require('../utils/helpers');

// Get all properties with filters (cached)
const getProperties = async (req, res) => {
  const startedAt = Date.now();
  try {
    let filters = {};

    if (req.query.city) {
      filters['address.city'] = { $regex: req.query.city, $options: 'i' };
    }
    // Text search across title, description and city
    if (req.query.search) {
      const s = req.query.search;
      filters.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { 'address.city': { $regex: s, $options: 'i' } },
      ];
    }
    if (req.query.propertyType) {
      filters.propertyType = req.query.propertyType;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filters['price.monthly'] = {};
      if (req.query.minPrice) filters['price.monthly'].$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filters['price.monthly'].$lte = parseInt(req.query.maxPrice);
    }
    if (req.query.bedrooms) {
      filters.bedrooms = { $gte: parseInt(req.query.bedrooms) };
    }
    // Add other filters as needed

    // Pagination & sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;

    // Cache the final ranked response for 60s (keyed by request query params)
    const cachePrefix = 'properties:aiRanked';
    const cacheParams = { ...req.query, page, limit };
    const result = await getOrSetCache(cachePrefix, cacheParams, 60, async () => {
      // Fetch all matching properties, then score + sort, then paginate (as requested)
      const allMatching = await Property.find(filters).lean();

      // Compute dataset-level price stats from results
      const prices = allMatching
        .map((p) => Number(p?.price?.monthly))
        .filter((n) => Number.isFinite(n) && n > 0);

      const averagePrice = prices.length
        ? Math.round(prices.reduce((sum, n) => sum + n, 0) / prices.length)
        : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const minPrice = prices.length ? Math.min(...prices) : 0;

      // Demand threshold (deterministic): use average views across the matched result set
      const viewsList = allMatching
        .map((p) => Number(p?.views))
        .filter((n) => Number.isFinite(n) && n >= 0);
      const averageViews = viewsList.length
        ? Math.round(viewsList.reduce((sum, n) => sum + n, 0) / viewsList.length)
        : 0;
      const viewsThreshold = averageViews;

      // Compute normalization bounds for demand
      const maxViews = allMatching.reduce((m, p) => Math.max(m, Number(p?.views) || 0), 0);
      const maxBookingsCount = allMatching.reduce((m, p) => Math.max(m, Number(p?.bookingsCount) || 0), 0);

      const scoreContext = {
        minPrice,
        maxPrice,
        referencePrice: averagePrice,
        maxViews,
        maxBookingsCount,
      };

      const scored = allMatching.map((p) => {
        const monthly = Number(p?.price?.monthly);
        const hasMonthly = Number.isFinite(monthly) && monthly > 0;
        const isBestValue = averagePrice > 0 && hasMonthly && monthly < 0.8 * averagePrice;
        const isHighDemand = (Number(p?.views) || 0) > viewsThreshold;
        const aiLabel = isBestValue ? 'Best Value' : isHighDemand ? 'High Demand' : 'Recommended';

        return {
          ...p,
          aiScore: calculateScore(p, scoreContext),
          aiLabel,
        };
      });

      scored.sort((a, b) => {
        const d = (b.aiScore || 0) - (a.aiScore || 0);
        if (d !== 0) return d;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        return bt - at;
      });

      const total = scored.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(Math.max(page, 1), totalPages);
      const start = (safePage - 1) * limit;
      const properties = scored.slice(start, start + limit);

      return { properties, total, totalPages, page: safePage, averagePrice, maxPrice, viewsThreshold };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    try {
      const durationMs = Date.now() - startedAt;
      // Keep logging side-effect free: never throw, never block response
      console.info(`[getProperties] completed in ${durationMs}ms`, {
        path: req.originalUrl,
      });
    } catch {
      // ignore logging errors
    }
  }
};

// Get property by ID (include reviews)
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views after the property is found (backward-compatible if views is missing)
    const currentViews = Number.isFinite(property.views) ? property.views : Number(property.views) || 0;
    property.views = currentViews + 1;
    Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch((err) => {
      console.error('View count update failed:', err);
    });

    // Fetch reviews linked to this property
    const reviews = await Review.find({ property: property._id })
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean();

    // Embed reviews into property payload for frontend compatibility
    const payload = property.toObject();
    payload.reviews = reviews;
    payload.numReviews = reviews.length;
    if (!payload.rating && reviews.length) {
      const avg = Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1));
      payload.rating = avg;
    }
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new property
const createProperty = async (req, res) => {
  try {
    const newProperty = new Property({
      ...req.body,
      owner: req.user._id,
    });
    await newProperty.save();
    // Invalidate cache for property listings
    await invalidateByPrefix('properties');
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(property, req.body);
    await property.save();
    await invalidateByPrefix('properties');
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await property.remove();
    await invalidateByPrefix('properties');
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload property images
const uploadPropertyImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const files = req.files;
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path);
      property.images.push({ url: result.secure_url, public_id: result.public_id });
    }
    await property.save();

    res.json(property.images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
};
