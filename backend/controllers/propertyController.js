const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');
const { getOrSetCache, invalidateByPrefix } = require('../utils/cache');

// Get all properties with filters (cached)
const getProperties = async (req, res) => {
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
    const sortParam = req.query.sort || '-createdAt';

    const cachePrefix = 'properties';
    const params = { page, limit, sortParam, ...req.query };

    const result = await getOrSetCache(cachePrefix, params, 60, async () => {
      const total = await Property.countDocuments(filters);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const properties = await Property.find(filters)
        .sort(sortParam)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return { properties, total, totalPages, page };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
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
