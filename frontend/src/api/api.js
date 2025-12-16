import axios from 'axios';

/**
 * Axios instance for API calls
 * Base URL is set from environment variable or defaults to localhost
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Send httpOnly cookies with every request
});

/**
 * Request Interceptor
 * Adds authorization token to all requests if available
 */
api.interceptors.request.use(
  (config) => {
    // Ensure credentials flag is always set
    config.withCredentials = true;
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || config.params);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios and errors
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`,);
    }
    
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`[API Error ${status}]`, data.message || data.error || 'Unknown error');
      
      switch (status) {
        case 401:
          // Unauthorized - let callers/contexts handle; avoid hard redirects that can log users out on refresh
          console.warn('Unauthorized access');
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.warn('Access forbidden');
          // Optionally show a toast/notification
          break;
          
        case 404:
          // Not found
          console.warn('Resource not found');
          break;
          
        case 422:
          // Validation error
          console.warn('Validation error:', data.errors || data.message);
          break;
          
        case 429:
          // Too many requests
          console.warn('Rate limit exceeded');
          // Optionally show a toast/notification
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('Server error - please try again later');
          // Optionally show a toast/notification
          break;
          
        default:
          console.error('An error occurred:', data.message || 'Unknown error');
      }
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Network Error] No response received', error.request);
      console.error('Network error - please check your internet connection');
      // Optionally show a toast/notification
      
    } else {
      // Something happened in setting up the request
      console.error('[API Setup Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle file uploads
 * @param {string} url - API endpoint
 * @param {FormData} formData - Form data with files
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise} API response
 */
export const uploadFile = async (url, formData, onUploadProgress) => {
  try {
    // Ensure Content-Type is NOT forced here so the browser can add the multipart boundary
    // Increase timeout for uploads (some uploads + Cloudinary processing can take longer than default 30s)
    const response = await api.post(url, formData, {
      timeout: 120000, // 2 minutes
      // Unset the Content-Type header for this request so the browser/axios will set
      // the proper multipart boundary. This prevents the default 'application/json'
      // header from being sent and allows multer to parse FormData.
      headers: { 'Content-Type': undefined },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
  });
    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

/**
 * Helper function to download files
 * @param {string} url - API endpoint
 * @param {string} filename - Name for downloaded file
 * @returns {Promise} Download result
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
    
    return { success: true };
  } catch (error) {
    console.error('File download failed:', error);
    throw error;
  }
};

/**
 * Helper function to check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  try {
    const raw = getCookie('user');
    const user = raw ? JSON.parse(raw) : null;
    return !!(user && user.token);
  } catch (err) {
    return false;
  }
};

/**
 * Helper function to get current user
 * @returns {Object|null} Current user object or null
 */
export const getCurrentUser = () => {
  try {
    const raw = getCookie('user');
    const user = raw ? JSON.parse(raw) : null;
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Helper function to clear authentication
 */
export const clearAuth = () => {
  try { deleteCookie('user'); } catch (e) {}
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Helper function to set authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
