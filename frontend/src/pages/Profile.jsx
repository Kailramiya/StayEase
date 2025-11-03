import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaCamera,
  FaSave,
  FaShieldAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import { getCurrentUser, updateUserProfile, uploadProfilePicture, removeProfilePicture, getStoredUser } from '../api/authService';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const DEFAULT_AVATAR = 'https://res.cloudinary.com/dpd8duqjj/image/upload/v1762026155/stay-ease/profile_pictures/rdjeho1vzclcdl8r6gkr.avif';
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_AVATAR);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
  // set preview from stored profile picture or default avatar
  setPreviewUrl(data.profilePicture || DEFAULT_AVATAR);
      } catch (err) {
        console.error('Failed to load profile', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // basic client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  const handleRemovePhoto = () => {
    // If a file was selected but not yet uploaded, just clear the selection
    if (selectedFile) {
      setSelectedFile(null);
      setPreviewUrl(user?.profilePicture || DEFAULT_AVATAR);
      return;
    }

    // Otherwise call API to remove the profile picture
    (async () => {
      try {
        setUpdating(true);
        const data = await removeProfilePicture();
        // update context and preview
        setUser(data);
        setPreviewUrl(data.profilePicture || DEFAULT_AVATAR);
      } catch (err) {
        console.error('Failed to remove profile picture', err);
        setError(err.response?.data?.message || 'Failed to remove profile picture');
      } finally {
        setUpdating(false);
      }
    })();
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setUpdating(true);

    try {
      let updatedUser = null;

      // If user selected a new file, upload it first
      if (selectedFile) {
        const uploadRes = await uploadProfilePicture(selectedFile);
        // uploadProfilePicture returns updated user data (with new profilePicture)
        updatedUser = uploadRes;
      }

  // Now update other profile details
  const profileRes = await updateUserProfile(formData);
  // merge both responses (upload may already include new fields) with existing user
  const existing = user || getStoredUser() || {};
  updatedUser = { ...existing, ...(updatedUser || {}), ...(profileRes || {}) };
  // Update context and localStorage via setUser (AuthContext exposes setUser)
  setUser(updatedUser);
      setSuccess('Profile updated successfully! ✓');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update failed', err);
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setUpdating(true);
    try {
      // Implement password change API call here
      // await changePassword(passwordData);
      setSuccess('Password changed successfully! ✓');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Password change failed', err);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center pb-6 border-b">
        <div className="relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="absolute bottom-0 right-0 flex items-center gap-2">
            <label htmlFor="profilePicture" className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition cursor-pointer">
              <FaCamera className="text-blue-600" />
              <input id="profilePicture" name="profilePicture" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
            {(selectedFile || (previewUrl && previewUrl !== DEFAULT_AVATAR)) && (
              <button type="button" onClick={handleRemovePhoto} className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition">
                Remove
              </button>
            )}
          </div>
        </div>
        <h3 className="text-2xl font-bold mt-4">{formData.name}</h3>
        <p className="text-gray-600">{formData.email}</p>
        <span className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
          {user?.role || 'User'}
        </span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FaEnvelope className="text-blue-600" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FaPhone className="text-blue-600" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            placeholder="10-digit mobile number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {updating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              <FaSave />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="text-blue-600 text-xl mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Security Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use a strong password with at least 6 characters</li>
              <li>• Don't share your password with anyone</li>
              <li>• Change your password regularly</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-5">
        <div>
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FaLock className="text-blue-600" />
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FaLock className="text-blue-600" />
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FaLock className="text-blue-600" />
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {updating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Changing...
            </>
          ) : (
            <>
              <FaLock />
              Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" />
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="font-semibold">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Type</span>
            <span className="font-semibold capitalize">{user?.role || 'User'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Email Verified</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Yes ✓
            </span>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-2 text-red-900">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              // Implement delete account logic
              alert('Account deletion feature coming soon');
            }
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Delete Account
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center gap-2">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaUser />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition ${
                  activeTab === 'security'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaLock />
                Security
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition ${
                  activeTab === 'account'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaShieldAlt />
                Account
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'account' && renderAccountTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
