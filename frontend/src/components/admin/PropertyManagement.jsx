import React, { useEffect, useState } from 'react';
import {
  FaHome,
  FaBed,
  FaBath,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaImage,
  FaRedo,
  FaDownload
} from 'react-icons/fa';
import {
  fetchAllProperties,
  deleteProperty,
  createProperty,
  updateProperty,
  verifyProperty,
  updatePropertyStatus
} from '../../api/adminService';

const initialForm = {
  title: '',
  description: '',
  propertyType: 'apartment',
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  monthlyPrice: '',
  security: '',
  maintenance: '',
  amenities: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  furnished: 'semi-furnished',
  availability: 'available',
  isVerified: false,
  images: [],
  rules: '',
};

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrls, setImageUrls] = useState('');
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await fetchAllProperties({ limit: 1000 });
      const data = response.data || response.properties || response;
      const list = Array.isArray(data) ? data : [];
      setProperties(list);
    } catch (error) {
      console.error('Failed to load properties', error);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setImageUrls('');
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      alert('Property deleted successfully!');
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete property');
    }
  };

  const handleEdit = (prop) => {
    setEditingId(prop._id);
    const imgUrls = Array.isArray(prop.images)
      ? prop.images.map((img) => img.url).join(', ')
      : '';
    setImageUrls(imgUrls);
    
    setForm({
      title: prop.title || '',
      description: prop.description || '',
      propertyType: prop.propertyType || 'apartment',
      street: prop.address?.street || '',
      city: prop.address?.city || '',
      state: prop.address?.state || '',
      pincode: prop.address?.pincode || '',
      country: prop.address?.country || 'India',
      monthlyPrice: prop.price?.monthly ?? '',
      security: prop.price?.security ?? '',
      maintenance: prop.price?.maintenance ?? '',
      amenities: Array.isArray(prop.amenities) ? prop.amenities.join(', ') : '',
      bedrooms: prop.bedrooms ?? '',
      bathrooms: prop.bathrooms ?? '',
      area: prop.area ?? '',
      furnished: prop.furnished || 'semi-furnished',
      availability: prop.availability || 'available',
      isVerified: prop.isVerified || false,
      images: prop.images || [],
      rules: Array.isArray(prop.rules) ? prop.rules.join(', ') : '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Mark this property as verified?')) return;
    try {
      await verifyProperty(id);
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isVerified: true } : p))
      );
      alert('Property verified successfully!');
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to verify property');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePropertyStatus(id, status);
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, availability: status } : p))
      );
      alert('Status updated successfully!');
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update status');
    }
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    if (!form.pincode.trim()) return 'Pincode is required';
    if (form.monthlyPrice === '' || isNaN(Number(form.monthlyPrice)))
      return 'Monthly price must be a valid number';
    if (Number(form.monthlyPrice) < 0) return 'Monthly price cannot be negative';
    if (form.bedrooms === '' || isNaN(Number(form.bedrooms)))
      return 'Bedrooms must be a valid number';
    if (form.bathrooms === '' || isNaN(Number(form.bathrooms)))
      return 'Bathrooms must be a valid number';
    if (form.area === '' || isNaN(Number(form.area)))
      return 'Area must be a valid number';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    setSaving(true);

    const amenitiesArray = form.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const rulesArray = form.rules
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const imagesArray = imageUrls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, public_id: '' }));

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      propertyType: form.propertyType,
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim(),
      },
      price: {
        monthly: Number(form.monthlyPrice),
        security: Number(form.security) || 0,
        maintenance: Number(form.maintenance) || 0,
      },
      amenities: amenitiesArray,
      rules: rulesArray,
      images: imagesArray,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      furnished: form.furnished,
      availability: form.availability,
      isVerified: form.isVerified,
    };

    try {
      if (editingId) {
        const response = await updateProperty(editingId, payload);
        const updated = response.data || response;
        setProperties((prev) =>
          prev.map((p) => (p._id === editingId ? { ...p, ...updated } : p))
        );
        alert('Property updated successfully!');
      } else {
        const response = await createProperty(payload);
        const created = response.data || response;
        setProperties((prev) => [created, ...prev]);
        alert('Property created successfully!');
      }
      resetForm();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (editingId ? 'Failed to update property' : 'Failed to create property');
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Type', 'City', 'Bedrooms', 'Bathrooms', 'Area', 'Price', 'Status', 'Verified'];
    const csvData = filteredProperties.map(p => [
      p.title || 'N/A',
      p.propertyType || 'N/A',
      p.address?.city || 'N/A',
      p.bedrooms || 0,
      p.bathrooms || 0,
      p.area || 0,
      p.price?.monthly || 0,
      p.availability || 'available',
      p.isVerified ? 'Yes' : 'No'
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.propertyType?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || p.propertyType === filterType;
    const matchesCity = filterCity === 'all' || p.address?.city === filterCity;
    const matchesStatus = filterStatus === 'all' || p.availability === filterStatus;

    return matchesSearch && matchesType && matchesCity && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique cities
  const cities = [...new Set(properties.map(p => p.address?.city).filter(Boolean))];

  // Statistics
  const stats = {
    total: properties.length,
    available: properties.filter(p => p.availability === 'available').length,
    booked: properties.filter(p => p.availability === 'booked').length,
    verified: properties.filter(p => p.isVerified).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Property Management</h2>
          <p className="text-gray-600 mt-1">Manage all rental properties</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadProperties}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <FaRedo className="text-sm" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <FaDownload />
            Export
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <FaPlus />
              Add Property
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm font-medium">Total Properties</p>
            <FaHome className="text-blue-200 text-xl" />
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm font-medium">Available</p>
            <FaCheckCircle className="text-green-200 text-xl" />
          </div>
          <p className="text-3xl font-bold">{stats.available}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-100 text-sm font-medium">Booked</p>
            <FaTimesCircle className="text-yellow-200 text-xl" />
          </div>
          <p className="text-3xl font-bold">{stats.booked}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 text-sm font-medium">Verified</p>
            <FaCheckCircle className="text-purple-200 text-xl" />
          </div>
          <p className="text-3xl font-bold">{stats.verified}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? 'Edit Property' : 'Add New Property'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Cozy 2BHK Apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Property Type *</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="pg">PG</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the property in detail..."
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <FaImage /> Property Images
              </h3>
              <textarea
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URLs separated by commas"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Enter multiple image URLs separated by commas
              </p>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <FaMapMarkerAlt /> Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 400001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="India"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <FaBed /> Bedrooms *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <FaBath /> Bathrooms *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.bathrooms}
                    onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Area (sq ft) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.area}
                    onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Furnished</label>
                  <select
                    value={form.furnished}
                    onChange={(e) => setForm((f) => ({ ...f, furnished: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fully-furnished">Fully Furnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Availability</label>
                  <select
                    value={form.availability}
                    onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <FaRupeeSign /> Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Security Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.security}
                    onChange={(e) => setForm((f) => ({ ...f, security: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Maintenance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maintenance}
                    onChange={(e) => setForm((f) => ({ ...f, maintenance: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2000"
                  />
                </div>
              </div>
            </div>

            {/* Amenities & Rules */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amenities (comma-separated)</label>
                  <textarea
                    value={form.amenities}
                    onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. WiFi, Parking, Gym, Pool, Security"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Rules (comma-separated)</label>
                  <textarea
                    value={form.rules}
                    onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. No smoking, No pets, Vegetarian only"
                  />
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="isVerified"
                checked={form.isVerified}
                onChange={(e) => setForm((f) => ({ ...f, isVerified: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isVerified" className="text-sm font-medium">
                ✓ Mark as Verified Property
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {editingId ? 'Updating...' : 'Saving...'}
                  </span>
                ) : (
                  editingId ? 'Update Property' : 'Add Property'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-white border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
            </select>
          </div>

          <div>
            <select
              value={filterCity}
              onChange={(e) => {
                setFilterCity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <FaHome className="mx-auto text-5xl mb-3 opacity-50" />
                      <p className="text-lg font-medium">No properties found</p>
                      <p className="text-sm mt-1">
                        {searchQuery || filterType !== 'all' || filterCity !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Add a new property to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaHome className="text-gray-400" />
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {property.title}
                          </p>
                          {property.isVerified && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <FaCheckCircle /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-700">
                        {property.propertyType}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900">{property.address?.city}</p>
                        <p className="text-gray-500">{property.address?.state}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FaBed /> {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaBath /> {property.bathrooms}
                        </span>
                        <span>{property.area} sq ft</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">
                          ₹{Number(property.price?.monthly || 0).toLocaleString()}/mo
                        </p>
                        {property.price?.security > 0 && (
                          <p className="text-xs text-gray-500">
                            +₹{Number(property.price.security).toLocaleString()} security
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={property.availability}
                        onChange={(e) => handleStatusChange(property._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold border-0 focus:ring-2 focus:ring-blue-500 ${
                          property.availability === 'available'
                            ? 'bg-green-100 text-green-800'
                            : property.availability === 'booked'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(property)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {!property.isVerified && (
                          <button
                            onClick={() => handleVerify(property._id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Verify"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredProperties.length)}
              </span>{' '}
              of <span className="font-medium">{filteredProperties.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {showDetails && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Property Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Images */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedProperty.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Property ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div>
                <h4 className="font-bold text-2xl mb-2">{selectedProperty.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="capitalize">{selectedProperty.propertyType}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt />
                    {selectedProperty.address?.city}, {selectedProperty.address?.state}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-2">Description</h5>
                <p className="text-gray-700">{selectedProperty.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold mb-2">Property Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Bedrooms:</span> {selectedProperty.bedrooms}</p>
                    <p><span className="text-gray-600">Bathrooms:</span> {selectedProperty.bathrooms}</p>
                    <p><span className="text-gray-600">Area:</span> {selectedProperty.area} sq ft</p>
                    <p><span className="text-gray-600">Furnished:</span> {selectedProperty.furnished}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Pricing</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Monthly Rent:</span> ₹{Number(selectedProperty.price?.monthly || 0).toLocaleString()}</p>
                    {selectedProperty.price?.security > 0 && (
                      <p><span className="text-gray-600">Security:</span> ₹{Number(selectedProperty.price.security).toLocaleString()}</p>
                    )}
                    {selectedProperty.price?.maintenance > 0 && (
                      <p><span className="text-gray-600">Maintenance:</span> ₹{Number(selectedProperty.price.maintenance).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2">Amenities</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProperty.rules && selectedProperty.rules.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2">Rules</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {selectedProperty.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedProperty.availability === 'available'
                      ? 'bg-green-100 text-green-800'
                      : selectedProperty.availability === 'booked'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProperty.availability}
                  </span>
                </div>
                {selectedProperty.isVerified && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <FaCheckCircle /> Verified Property
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;