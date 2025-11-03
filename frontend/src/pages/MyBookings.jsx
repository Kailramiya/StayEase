import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getMyBookings } from '../api/bookingService';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        // bookingService may return response.data or data directly
        const list = res.data || res;
        setBookings(Array.isArray(list) ? list : (list.bookings || []));
      } catch (err) {
        console.error('Failed to load bookings', err);
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">You don't have any bookings yet.</p>
            <Link to="/properties" className="mt-4 inline-block text-blue-600 hover:underline">
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div>
                  <Link to={`/bookings/${b._id}`} className="font-semibold text-blue-700 hover:underline">
                    {b.property?.title || (b.property && b.property.title) || 'Property'}
                  </Link>
                  <div className="text-sm text-gray-600">{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Status: <span className="font-medium">{b.status}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₹{(b.totalPrice || b.amount || 0).toLocaleString()}</div>
                  <Link to={`/bookings/${b._id}`} className="mt-2 inline-block text-sm text-gray-600 hover:underline">View details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
