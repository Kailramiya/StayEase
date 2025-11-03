import api from './api';

/**
 * Property Service - Handles all property-related API calls
 */

// ============================================
// Property Listing & Search
// ============================================

/**
 * Fetch properties with optional filters and pagination
 * @param {Object} filters - Query filters
 * @param {string} filters.search - Search term for property title/description
 * @param {string} filters.city - Filter by city
 * @param {string} filters.state - Filter by state
 * @param {string} filters.propertyType - Filter by type (apartment, house, villa, etc.)
 * @param {string} filters.furnished - Filter by furnished status (furnished, semi-furnished, unfurnished)
 * @param {number} filters.minPrice - Minimum monthly price
 * @param {number} filters.maxPrice - Maximum monthly price
 * @param {number} filters.bedrooms - Number of bedrooms
 * @param {number} filters.bathrooms - Number of bathrooms
 * @param {string} filters.availability - Filter by availability (available, booked, maintenance)
 * @param {string} filters.sortBy - Sort field (price, rating, createdAt)
 * @param {string} filters.order - Sort order (asc, desc)
 * @param {number} filters.page - Page number for pagination
 * @param {number} filters.limit - Number of items per page
 * @returns {Promise} Properties array with pagination info
 */
export const getProperties = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await api.get(`/properties?${query}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch properties:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get details of a single property by ID
 * @param {string} propertyId - Property ID
 * @returns {Promise} Property details
 */
export const getPropertyById = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property details:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Search properties with advanced filters
 * @param {Object} searchParams - Search parameters
 * @returns {Promise} Matching properties
 */
export const searchProperties = async (searchParams) => {
  try {
    const response = await api.post('/properties/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Failed to search properties:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Property Management (Owner/Admin)
// ============================================

/**
 * Create a new property (admin or owner)
 * @param {Object} propertyData - Property details
 * @param {string} propertyData.title - Property title
 * @param {string} propertyData.description - Property description
 * @param {string} propertyData.propertyType - Property type
 * @param {Object} propertyData.address - Address object (street, city, state, pincode)
 * @param {Object} propertyData.price - Price object (monthly, security, maintenance)
 * @param {number} propertyData.bedrooms - Number of bedrooms
 * @param {number} propertyData.bathrooms - Number of bathrooms
 * @param {number} propertyData.area - Area in sq ft
 * @param {string} propertyData.furnished - Furnished status
 * @param {Array<string>} propertyData.amenities - List of amenities
 * @param {Array<string>} propertyData.rules - Property rules
 * @returns {Promise} Created property
 */
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    console.log('Property created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create property:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update an existing property by ID (admin or owner)
 * @param {string} propertyId - Property ID
 * @param {Object} updatedData - Fields to update
 * @returns {Promise} Updated property
 */
export const updateProperty = async (propertyId, updatedData) => {
  try {
    const response = await api.put(`/properties/${propertyId}`, updatedData);
    console.log('Property updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update property:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Delete a property by ID (admin or owner)
 * @param {string} propertyId - Property ID
 * @returns {Promise} Success response
 */
export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}`);
    console.log('Property deleted successfully:', propertyId);
    return response.data;
  } catch (error) {
    console.error('Failed to delete property:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get properties owned by logged-in user
 * @param {Object} params - Query parameters
 * @returns {Promise} User's properties
 */
export const getMyProperties = async (params = {}) => {
  try {
    const response = await api.get('/properties/my', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user properties:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Property Images
// ============================================

/**
 * Upload images for a property
 * @param {string} propertyId - Property ID
 * @param {Array<File>} images - Array of image files
 * @param {Function} onUploadProgress - Progress callback (optional)
 * @returns {Promise} Updated property with images
 */
export const uploadPropertyImages = async (propertyId, images, onUploadProgress) => {
  try {
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    
    const response = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    
    console.log('Images uploaded successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to upload images:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Delete a property image
 * @param {string} propertyId - Property ID
 * @param {string} imageId - Image ID or URL
 * @returns {Promise} Updated property
 */
export const deletePropertyImage = async (propertyId, imageId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
    console.log('Image deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to delete image:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Set primary/cover image for property
 * @param {string} propertyId - Property ID
 * @param {string} imageId - Image ID to set as primary
 * @returns {Promise} Updated property
 */
export const setPrimaryImage = async (propertyId, imageId) => {
  try {
    const response = await api.put(`/properties/${propertyId}/images/primary`, { imageId });
    console.log('Primary image set successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to set primary image:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Property Availability
// ============================================

/**
 * Update property availability status
 * @param {string} propertyId - Property ID
 * @param {string} availability - Availability status (available, booked, maintenance)
 * @returns {Promise} Updated property
 */
export const updateAvailability = async (propertyId, availability) => {
  try {
    const response = await api.patch(`/properties/${propertyId}/availability`, { availability });
    console.log('Availability updated:', availability);
    return response.data;
  } catch (error) {
    console.error('Failed to update availability:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Check if property is available for specific dates
 * @param {string} propertyId - Property ID
 * @param {string} checkIn - Check-in date
 * @param {string} checkOut - Check-out date
 * @returns {Promise} Availability status
 */
export const checkPropertyAvailability = async (propertyId, checkIn, checkOut) => {
  try {
    const response = await api.post(`/properties/${propertyId}/check-availability`, {
      checkIn,
      checkOut
    });
    return response.data;
  } catch (error) {
    console.error('Failed to check availability:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Featured & Recommended Properties
// ============================================

/**
 * Get featured properties
 * @param {number} limit - Number of properties to fetch
 * @returns {Promise} Featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    const response = await api.get(`/properties/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch featured properties:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get recommended properties based on user preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise} Recommended properties
 */
export const getRecommendedProperties = async (preferences = {}) => {
  try {
    const response = await api.post('/properties/recommended', preferences);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recommended properties:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get similar properties
 * @param {string} propertyId - Property ID
 * @param {number} limit - Number of similar properties
 * @returns {Promise} Similar properties
 */
export const getSimilarProperties = async (propertyId, limit = 4) => {
  try {
    const response = await api.get(`/properties/${propertyId}/similar?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch similar properties:', error.response?.data?.message || error.message);
    return { properties: [] };
  }
};

// ============================================
// Property Statistics
// ============================================

/**
 * Get property statistics (views, bookings, etc.)
 * @param {string} propertyId - Property ID
 * @returns {Promise} Property statistics
 */
export const getPropertyStats = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property stats:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Increment property view count
 * @param {string} propertyId - Property ID
 * @returns {Promise} Success response
 */
export const incrementPropertyViews = async (propertyId) => {
  try {
    const response = await api.post(`/properties/${propertyId}/view`);
    return response.data;
  } catch (error) {
    console.error('Failed to increment views:', error.response?.data?.message || error.message);
    // Fail silently for view tracking
    return null;
  }
};

// ============================================
// Property Filters & Categories
// ============================================

/**
 * Get available cities with property counts
 * @returns {Promise} Cities list
 */
export const getAvailableCities = async () => {
  try {
    const response = await api.get('/properties/cities');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch cities:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get property types with counts
 * @returns {Promise} Property types list
 */
export const getPropertyTypes = async () => {
  try {
    const response = await api.get('/properties/types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property types:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get price range statistics
 * @param {string} city - City name (optional)
 * @returns {Promise} Price range data
 */
export const getPriceRange = async (city = null) => {
  try {
    const params = city ? { city } : {};
    const response = await api.get('/properties/price-range', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch price range:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Property Verification
// ============================================

/**
 * Submit property for verification
 * @param {string} propertyId - Property ID
 * @returns {Promise} Verification request status
 */
export const submitForVerification = async (propertyId) => {
  try {
    const response = await api.post(`/properties/${propertyId}/verify-request`);
    console.log('Verification request submitted');
    return response.data;
  } catch (error) {
    console.error('Failed to submit verification request:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Nearby Properties
// ============================================

/**
 * Get properties near a location
 * @param {Object} location - Location coordinates
 * @param {number} location.latitude - Latitude
 * @param {number} location.longitude - Longitude
 * @param {number} radius - Radius in kilometers
 * @returns {Promise} Nearby properties
 */
export const getNearbyProperties = async (location, radius = 5) => {
  try {
    const response = await api.post('/properties/nearby', {
      ...location,
      radius
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch nearby properties:', error.response?.data?.message || error.message);
    throw error;
  }
};
