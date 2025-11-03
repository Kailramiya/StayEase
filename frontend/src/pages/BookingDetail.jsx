import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getBookingById, cancelBooking } from '../api/bookingService';

const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await getBookingById(id);
        const data = res.data || res;
        setBooking(data.booking || data);
      } catch (err) {
        console.error('Failed to load booking', err);
        setError(err.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, navigate]);

  const handleCancel = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      await cancelBooking(booking._id);
      // optimistic UI: update status
      setBooking({ ...booking, status: 'cancelled' });
    } catch (err) {
      console.error('Cancel failed', err);
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-gray-600">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Booking Details</h2>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Property</h3>
              <p className="text-gray-700">{booking.property?.title || booking.property}</p>
            </div>

            <div>
              <h3 className="font-semibold">Dates</h3>
              <p className="text-gray-700">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p>
            </div>

            <div>
              <h3 className="font-semibold">Tenant</h3>
              <p className="text-gray-700">{booking.tenantName || booking.user?.name || user?.name}</p>
              <p className="text-gray-700 text-sm">{booking.tenantEmail || booking.user?.email || user?.email}</p>
            </div>

            <div>
              <h3 className="font-semibold">Amount</h3>
              <p className="text-gray-700">₹{(booking.totalPrice || booking.amount || 0).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="font-semibold">Status</h3>
              <p className="text-gray-700">{booking.status}</p>
            </div>

            {booking.payment && (
              <div>
                <h3 className="font-semibold">Payment</h3>
                <p className="text-gray-700">Transaction: {booking.payment.transactionId || booking.payment.razorpayPaymentId || '-'}</p>
                <p className="text-sm text-gray-500">Method: {booking.payment.paymentMethod || booking.payment.method || '—'}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}

            <button onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded-lg">Back</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
