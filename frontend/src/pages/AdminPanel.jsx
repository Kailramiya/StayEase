import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaHome, 
  FaCalendarCheck, 
  FaStar, 
  FaChartLine,
  FaSignOutAlt 
} from 'react-icons/fa';
import UserManagement from '../components/admin/UserManagement';
import PropertyManagement from '../components/admin/PropertyManagement';
import BookingManagement from '../components/admin/BookingManagement';
import api from '../api/api';
import useAuth from '../hooks/useAuth';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Statistics state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/');
      alert('Access denied. Admin only.');
      return;
    }

    // Fetch statistics for dashboard by calling admin endpoints
    const fetchDashboardStats = async () => {
      try {
        const [usersRes, propsRes, bookingsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/properties'),
          api.get('/admin/bookings'),
        ]);

        const users = usersRes.data || usersRes;
        const properties = propsRes.data || propsRes;
        const bookings = bookingsRes.data || bookingsRes;

        const totalRevenue = (Array.isArray(bookings) ? bookings : [])
          .reduce((sum, b) => sum + (Number(b.totalPrice || b.totalAmount || 0) || 0), 0);

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalProperties: Array.isArray(properties) ? properties.length : 0,
          totalBookings: Array.isArray(bookings) ? bookings.length : 0,
          totalRevenue,
          recentActivity: [],
        });
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      }
    };

    fetchDashboardStats();
  }, [user, navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FaUsers className="text-4xl opacity-80" />
            <span className="text-3xl font-bold">{stats.totalUsers}</span>
          </div>
          <p className="text-blue-100">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FaHome className="text-4xl opacity-80" />
            <span className="text-3xl font-bold">{stats.totalProperties}</span>
          </div>
          <p className="text-green-100">Total Properties</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FaCalendarCheck className="text-4xl opacity-80" />
            <span className="text-3xl font-bold">{stats.totalBookings}</span>
          </div>
          <p className="text-purple-100">Total Bookings</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FaChartLine className="text-4xl opacity-80" />
            <span className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-yellow-100">Total Revenue</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-left transition"
          >
            <FaUsers className="text-2xl mb-2" />
            <p className="font-semibold">Manage Users</p>
            <p className="text-sm text-gray-600">Add, edit, or remove users</p>
          </button>
          
          <button
            onClick={() => setActiveTab('properties')}
            className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg text-left transition"
          >
            <FaHome className="text-2xl mb-2" />
            <p className="font-semibold">Manage Properties</p>
            <p className="text-sm text-gray-600">Add, edit, or verify properties</p>
          </button>
          
          <button
            onClick={() => setActiveTab('bookings')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg text-left transition"
          >
            <FaCalendarCheck className="text-2xl mb-2" />
            <p className="font-semibold">Manage Bookings</p>
            <p className="text-sm text-gray-600">View and manage all bookings</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        {stats.recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">{activity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return <UserManagement />;
      case 'properties':
        return <PropertyManagement />;
      case 'bookings':
        return <BookingManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">StayEase Admin Panel</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaChartLine />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaUsers />
              Users
            </button>
            
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'properties'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaHome />
              Properties
            </button>
            
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaCalendarCheck />
              Bookings
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
