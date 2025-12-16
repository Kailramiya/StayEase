import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaShieldAlt,
  FaCheckCircle,
  FaInfoCircle 
} from 'react-icons/fa';
import { createBooking } from '../api/bookingService';
import { getPropertyById } from '../api/propertyService';
import PaymentButton from '../components/payment/PaymentButton';
import useAuth from '../hooks/useAuth';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    tenantName: user?.name || '',
    tenantEmail: user?.email || '',
    tenantPhone: '',
    additionalNotes: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(propertyId);
        const propertyData = data.data || data;
        
        if (!propertyData) {
          setError('Property not found');
          return;
        }

        if (propertyData.availability !== 'available') {
          setError('This property is not available for booking');
          return;
        }

        setProperty(propertyData);
      } catch (err) {
        console.error('Failed to fetch property', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, user, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateRent = () => {
    if (!formData.checkIn || !formData.checkOut || !property) return 0;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.max(1, Math.ceil((checkOut - checkIn) / msPerDay));

    const dailyRate = (property.price?.monthly || 0) / 30; // derive daily from monthly
    return Math.round(dailyRate * days);
  };

  const totalAmount = calculateRent() + (property?.price?.security || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.checkIn || !formData.checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (new Date(formData.checkIn) < new Date()) {
      setError('Check-in date cannot be in the past');
      return;
    }

    if (!formData.tenantPhone || formData.tenantPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setBookingLoading(true);
    try {
      // Backend now expects days (legacy months also supported)
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(1, Math.ceil((checkOutDate - checkInDate) / msPerDay));

      const months = Math.max(1, Math.ceil(days / 30)); // legacy compatibility

      const bookingData = {
        propertyId: propertyId,
        checkIn: formData.checkIn,
        days,
        months, // send both to satisfy older backend deployments
        tenantName: formData.tenantName,
        tenantEmail: formData.tenantEmail,
        tenantPhone: formData.tenantPhone,
        notes: formData.additionalNotes,
        totalAmount: totalAmount,
        rent: calculateRent(),
        securityDeposit: property?.price?.security || 0,
      };

      const response = await createBooking(bookingData);
      // backend returns { booking, paymentOrder }
      const resp = response.data || response;
      const newBooking = resp.booking || resp;
      const newPaymentOrder = resp.paymentOrder || null;
      setBookingId(newBooking._id);
      setPaymentOrder(newPaymentOrder);
      // Don't set success yet - wait for payment
    } catch (err) {
      console.error('Booking creation failed', err);
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handlePaymentFail = () => {
    setError('Payment failed. Please try again or contact support.');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading checkout details...</p>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaInfoCircle className="text-red-500 text-5xl mx-auto mb-4" />
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate('/properties')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your payment was successful. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      <FaCalendarAlt className="inline mr-2" />
                      Check-In Date *
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      <FaCalendarAlt className="inline mr-2" />
                      Check-Out Date *
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Tenant Details */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="tenantEmail"
                        value={formData.tenantEmail}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="tenantPhone"
                        value={formData.tenantPhone}
                        onChange={handleChange}
                        required
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Any special requests or information..."
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {!bookingId && (
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {bookingLoading ? 'Creating Booking...' : 'Proceed to Payment'}
                  </button>
                )}
              </form>

              {bookingId && (
                <div className="mt-6">
                  <PaymentButton
                    bookingId={bookingId}
                    amount={totalAmount}
                    paymentOrder={paymentOrder}
                    propertyName={property?.title}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFail}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Property & Price Summary */}
          <div className="space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Property Details</h3>
              
              {property?.images?.[0]?.url && (
                <img
                  src={property.images[0].url}
                  alt={property.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              <h4 className="font-bold text-lg mb-2">{property?.title}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {property?.address?.city}, {property?.address?.state}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {property?.propertyType} • {property?.furnished}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <FaMoneyBillWave className="inline mr-2" />
                Price Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Daily Rate (derived)</span>
                  <span>
                    ₹{(((property?.price?.monthly || 0) / 30) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {formData.checkIn && formData.checkOut && (
                  <div className="flex justify-between text-gray-700">
                    <span>Duration</span>
                    <span>
                      {Math.max(1, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)))} day(s)
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Total Rent</span>
                  <span>₹{calculateRent().toLocaleString()}</span>
                </div>

                {property?.price?.security > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>
                      <FaShieldAlt className="inline mr-1" />
                      Security Deposit
                    </span>
                    <span>₹{property.price.security.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                * Security deposit will be refunded at the end of your tenancy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
