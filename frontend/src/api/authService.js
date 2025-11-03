import api, { uploadFile } from './api';

/**
 * Auth Service - Handles all authentication-related API calls
 */

// ============================================
// Authentication
// ============================================

/**
 * Login user with credentials
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} User data with token
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const userData = response.data;
    
    // Store user data in cookie
    if (userData.token) {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
    }
    
    return userData;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userInfo - User registration data
 * @param {string} userInfo.name - User full name
 * @param {string} userInfo.email - User email
 * @param {string} userInfo.password - User password
 * @param {string} userInfo.phone - User phone number (optional)
 * @returns {Promise} User data with token
 */
export const registerUser = async (userInfo) => {
  try {
    const response = await api.post('/auth/register', userInfo);
    const userData = response.data;
    
    // Store user data in cookie
    if (userData.token) {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
    }
    
    return userData;
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Logout user
 * Clears user data from localStorage and removes auth token
 */
export const logoutUser = () => {
  try {
  // remove cookie
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
    // Clear auth header
    delete api.defaults.headers.common['Authorization'];
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// ============================================
// User Profile
// ============================================

/**
 * Get current user profile
 * @returns {Promise} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const { data } = await api.get('/auth/me');
    
    // Update localStorage with latest user data
    const cookieMatch = document.cookie.match(/(?:^|; )user=([^;]+)/);
    if (cookieMatch) {
      try {
        const storedUser = JSON.parse(decodeURIComponent(cookieMatch[1]));
        const updatedUser = { ...storedUser, ...data };
        document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      } catch (err) {
        console.warn('Failed to update user cookie', err);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch current user:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} payload - User data to update
 * @param {string} payload.name - User name
 * @param {string} payload.email - User email
 * @param {string} payload.phone - User phone
 * @returns {Promise} Updated user data
 */
export const updateUserProfile = async (payload) => {
  try {
    const { data } = await api.put('/auth/me', payload);
    console.log("payload",payload);
    // Update cookie with new user data
    const cookieMatch = document.cookie.match(/(?:^|; )user=([^;]+)/);
    if (cookieMatch) {
      try {
        const storedUser = JSON.parse(decodeURIComponent(cookieMatch[1]));
        const updatedUser = { ...storedUser, ...data };
        document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      } catch (err) {
        console.warn('Failed to persist updated user in cookie', err);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Failed to update profile:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Upload user profile picture
 * @param {File} file - Image file
 * @returns {Promise} Updated user with new profile picture
 */
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    // Use uploadFile helper which ensures the browser sets the multipart boundary
    const data = await uploadFile('/auth/upload-profile-picture', formData);

    // Update cookie with returned user data
    const cookieMatch = document.cookie.match(/(?:^|; )user=([^;]+)/);
    const storedUser = cookieMatch ? JSON.parse(decodeURIComponent(cookieMatch[1])) : {};
    const updatedUser = { ...storedUser, ...data };
    try {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
    } catch (err) {
      console.warn('Failed to persist updated user', err);
    }

    return data;
  } catch (error) {
    console.error('Failed to upload profile picture:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Remove user's profile picture (reset to default)
 * @returns {Promise} Updated user data
 */
export const removeProfilePicture = async () => {
  try {
    const { data } = await api.delete('/auth/profile-picture');
  const cookieMatch2 = document.cookie.match(/(?:^|; )user=([^;]+)/);
  const storedUser = cookieMatch2 ? JSON.parse(decodeURIComponent(cookieMatch2[1])) : {};
    const updatedUser = { ...storedUser, ...data };
    try {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
    } catch (err) {
      console.warn('Failed to persist updated user', err);
    }
    return data;
  } catch (error) {
    console.error('Failed to remove profile picture:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Password Management
// ============================================

/**
 * Change user password
 * @param {Object} passwords - Password data
 * @param {string} passwords.currentPassword - Current password
 * @param {string} passwords.newPassword - New password
 * @returns {Promise} Success message
 */
export const changePassword = async (passwords) => {
  try {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  } catch (error) {
    console.error('Failed to change password:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Request password reset email
 * @param {string} email - User email
 * @returns {Promise} Success message
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Failed to send reset email:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise} Success message
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.put(`/auth/reset-password/${token}`, { password: newPassword });
    return response.data;
  } catch (error) {
    console.error('Failed to reset password:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Email Verification
// ============================================

/**
 * Send email verification
 * @returns {Promise} Success message
 */
export const sendVerificationEmail = async () => {
  try {
    const response = await api.post('/auth/send-verification');
    return response.data;
  } catch (error) {
    console.error('Failed to send verification email:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} token - Verification token from email
 * @returns {Promise} Success message
 */
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify-email/${token}`);

    // mark emailVerified on stored user cookie if present
    const cookieMatch = document.cookie.match(/(?:^|; )user=([^;]+)/);
    if (cookieMatch) {
      try {
        const storedUser = JSON.parse(decodeURIComponent(cookieMatch[1]));
        storedUser.emailVerified = true;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(storedUser))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      } catch (err) {
        console.warn('Failed to update emailVerified cookie', err);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Failed to verify email:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get stored user from localStorage
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  try {
    const match = document.cookie.match(/(?:^|; )user=([^;]+)/);
    return match ? JSON.parse(decodeURIComponent(match[1])) : null;
  } catch (error) {
    console.error('Error parsing stored user from cookie:', error);
    return null;
  }
};

/**
 * Refresh auth token
 * @returns {Promise} New token
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    const { token } = response.data;

    // Update token in cookie
    const cookieMatch = document.cookie.match(/(?:^|; )user=([^;]+)/);
    if (cookieMatch) {
      try {
        const storedUser = JSON.parse(decodeURIComponent(cookieMatch[1]));
        storedUser.token = token;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(storedUser))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
      } catch (err) {
        console.warn('Failed to refresh token in cookie', err);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Failed to refresh token:', error.response?.data?.message || error.message);
    // If refresh fails, logout user
    logoutUser();
    throw error;
  }
};

/**
 * Delete user account
 * @param {string} password - User password for confirmation
 * @returns {Promise} Success message
 */
export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/auth/account', { data: { password } });
    
    // Clear user data
    logoutUser();
    
    return response.data;
  } catch (error) {
    console.error('Failed to delete account:', error.response?.data?.message || error.message);
    throw error;
  }
};

// ============================================
// Social Authentication (Optional)
// ============================================

/**
 * Login with Google
 * @param {string} googleToken - Google OAuth token
 * @returns {Promise} User data with token
 */
export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await api.post('/auth/google', { token: googleToken });
    const userData = response.data;

    if (userData.token) {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
    }

    return userData;
  } catch (error) {
    console.error('Google login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Login with Facebook
 * @param {string} facebookToken - Facebook OAuth token
 * @returns {Promise} User data with token
 */
export const loginWithFacebook = async (facebookToken) => {
  try {
    const response = await api.post('/auth/facebook', { token: facebookToken });
    const userData = response.data;

    if (userData.token) {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
    }

    return userData;
  } catch (error) {
    console.error('Facebook login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};
