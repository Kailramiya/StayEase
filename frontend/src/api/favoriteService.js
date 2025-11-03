import api from './api';

/**
 * Favorite Service - Handles all favorite/wishlist-related API calls
 */

// ============================================
// Favorite Management
// ============================================

/**
 * Add property to favorites
 * @param {string} propertyId - Property ID to add
 * @returns {Promise} Success response with favorite data
 */
export const addFavorite = async (propertyId) => {
  try {
    console.debug('[favoriteService] addFavorite payload:', { propertyId });
    const response = await api.post('/favorites', { propertyId });
    console.debug('[favoriteService] addFavorite response:', response.status, response.data);
    console.log('Property added to favorites:', propertyId);
    return response.data;
  } catch (error) {
    console.error('Failed to add favorite:', error?.response?.status, error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Alternative name for backwards compatibility
 * @param {string} propertyId - Property ID to add
 * @returns {Promise} Success response with favorite data
 */
export const addToFavorites = async (propertyId) => {
  return addFavorite(propertyId);
};

/**
 * Remove property from favorites
 * @param {string} propertyId - Property ID to remove
 * @returns {Promise} Success response
 */
export const removeFavorite = async (propertyId) => {
  try {
    const response = await api.delete(`/favorites/${propertyId}`);
    console.log('Property removed from favorites:', propertyId);
    return response.data;
  } catch (error) {
    console.error('Failed to remove favorite:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Alternative name for backwards compatibility
 * @param {string} propertyId - Property ID to remove
 * @returns {Promise} Success response
 */
export const removeFromFavorites = async (propertyId) => {
  return removeFavorite(propertyId);
};

/**
 * Get all favorite properties of logged in user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @param {string} params.sortBy - Sort field (createdAt, price, rating)
 * @returns {Promise} Array of favorite properties with details
 */
export const getFavorites = async (params = {}) => {
  try {
    const response = await api.get('/favorites', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorites:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Check if a property is in favorites
 * @param {string} propertyId - Property ID to check
 * @returns {Promise} Object with isFavorite boolean
 */
export const isFavorite = async (propertyId) => {
  try {
    const response = await api.get(`/favorites/check/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to check favorite status:', error.response?.data?.message || error.message);
    return { isFavorite: false };
  }
};

/**
 * Get favorites count
 * @returns {Promise} Object with total count
 */
export const getFavoritesCount = async () => {
  try {
    const response = await api.get('/favorites/count');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorites count:', error.response?.data?.message || error.message);
    return { count: 0 };
  }
};

/**
 * Toggle favorite status (add if not exists, remove if exists)
 * @param {string} propertyId - Property ID to toggle
 * @returns {Promise} Updated favorite status
 */
export const toggleFavorite = async (propertyId) => {
  try {
    const response = await api.post('/favorites/toggle', { propertyId });
    console.log('Favorite toggled for property:', propertyId, response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle favorite:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Additional Features
// ============================================

/**
 * Get favorite properties by city
 * @param {string} city - City name to filter by
 * @returns {Promise} Array of favorite properties in the city
 */
export const getFavoritesByCity = async (city) => {
  try {
    const response = await api.get('/favorites', {
      params: { city }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorites by city:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get favorite properties by type
 * @param {string} propertyType - Property type (apartment, house, villa, etc.)
 * @returns {Promise} Array of favorite properties of the type
 */
export const getFavoritesByType = async (propertyType) => {
  try {
    const response = await api.get('/favorites', {
      params: { propertyType }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorites by type:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Clear all favorites
 * @returns {Promise} Success response
 */
export const clearAllFavorites = async () => {
  try {
    const response = await api.delete('/favorites/clear-all');
    console.log('All favorites cleared');
    return response.data;
  } catch (error) {
    console.error('Failed to clear favorites:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get favorite properties IDs only (lightweight)
 * @returns {Promise} Array of property IDs
 */
export const getFavoriteIds = async () => {
  try {
    const response = await api.get('/favorites/ids');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorite IDs:', error.response?.data?.message || error.message);
    return { favoriteIds: [] };
  }
};

/**
 * Share favorites list
 * @param {string} email - Email to share with
 * @returns {Promise} Success response
 */
export const shareFavorites = async (email) => {
  try {
    const response = await api.post('/favorites/share', { email });
    console.log('Favorites shared with:', email);
    return response.data;
  } catch (error) {
    console.error('Failed to share favorites:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Export favorites to PDF
 * @returns {Promise} PDF blob
 */
export const exportFavoritesToPDF = async () => {
  try {
    const response = await api.get('/favorites/export/pdf', {
      responseType: 'blob'
    });

    // Create blob link to download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `my-favorites-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();

    // Clean up
    window.URL.revokeObjectURL(link.href);

    console.log('Favorites exported to PDF');
    return { success: true };
  } catch (error) {
    console.error('Failed to export favorites:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get favorites statistics
 * @returns {Promise} Favorites stats (total, by type, by city, average price)
 */
export const getFavoritesStats = async () => {
  try {
    const response = await api.get('/favorites/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch favorites stats:', error.response?.data?.message || error.message);
    return {
      total: 0,
      byType: {},
      byCity: {},
      averagePrice: 0
    };
  }
};

/**
 * Bulk add properties to favorites
 * @param {Array<string>} propertyIds - Array of property IDs
 * @returns {Promise} Success response with added count
 */
export const bulkAddFavorites = async (propertyIds) => {
  try {
    const response = await api.post('/favorites/bulk-add', { propertyIds });
    console.log(`${propertyIds.length} properties added to favorites`);
    return response.data;
  } catch (error) {
    console.error('Failed to bulk add favorites:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Bulk remove properties from favorites
 * @param {Array<string>} propertyIds - Array of property IDs
 * @returns {Promise} Success response with removed count
 */
export const bulkRemoveFavorites = async (propertyIds) => {
  try {
    const response = await api.post('/favorites/bulk-remove', { propertyIds });
    console.log(`${propertyIds.length} properties removed from favorites`);
    return response.data;
  } catch (error) {
    console.error('Failed to bulk remove favorites:', error.response?.data?.message || error.message);
    throw error;
  }
};
