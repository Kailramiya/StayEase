const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const AddOn = require('../models/AddOn');
const razorpay = require('../config/razorpay');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper: compute checkOut date by adding months to checkIn
const addMonthsToDate = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

// Helper: check overlapping bookings
const hasOverlap = async (propertyId, newCheckIn, newCheckOut) => {
  const conflicts = await Booking.findOne({
    property: propertyId,
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      { checkIn: { $lt: newCheckOut }, checkOut: { $gt: newCheckIn } },
    ],
  });
  return Boolean(conflicts);
};

// POST /api/bookings
const createBooking = async (req, res) => {
 
  const session = await mongoose.startSession();
  try {
    const { propertyId, checkIn, months, addOns = [], notes } = req.body;
    if (!propertyId || !checkIn || !months) {
      return res.status(400).json({ message: 'propertyId, checkIn and months are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const checkInDate = new Date(checkIn);
    if (isNaN(checkInDate)) return res.status(400).json({ message: 'Invalid checkIn date' });

    const checkOutDate = addMonthsToDate(checkInDate, parseInt(months, 10));

    // Availability check
    const conflict = await hasOverlap(propertyId, checkInDate, checkOutDate);
    if (conflict) return res.status(409).json({ message: 'Property not available for selected dates' });

    // Price calculation
    let base = property.price?.monthly || 0;
    let totalPrice = base * parseInt(months, 10);

    // add-ons calculation
    const addonsDocs = [];
    for (const aid of addOns) {
      const doc = await AddOn.findById(aid);
      if (doc) {
        addonsDocs.push(doc);
        if (doc.frequency === 'monthly') totalPrice += doc.price * parseInt(months, 10);
        else totalPrice += doc.price;
      }
    }

    // Create booking (pending)
    session.startTransaction();
    const booking = new Booking({
      user: req.user._id,
      property: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      months: parseInt(months, 10),
      totalPrice,
      status: 'pending',
      addOns: addonsDocs.map(a => a._id),
      notes,
    });
    await booking.save({ session });

    // Always create a local completed payment and confirm the booking (no external gateway)
    const amountPaise = Math.round(totalPrice * 100);

    const localPayment = new Payment({
      booking: booking._id,
      user: req.user._id,
      amount: totalPrice,
      paymentMethod: 'local',
      paymentStatus: 'completed',
      transactionId: `local_${Date.now()}`,
    });
    await localPayment.save({ session });

    booking.payment = localPayment._id;
    booking.status = 'confirmed';
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ booking, paymentOrder: { provider: 'local', paid: true, amount: amountPaise } });

    // Create Payment record
    const payment = new Payment({
      booking: booking._id,
      user: req.user._id,
      amount: totalPrice,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorOrder.id,
    });
    await payment.save({ session });

    // attach payment to booking
    booking.payment = payment._id;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ booking, paymentOrder: { provider: 'razorpay', orderId: razorOrder.id, amount: amountPaise, key: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error('createBooking error', error);
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/bookings/:id/verify
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params; // booking id
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    // verify signature
    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // update payment and booking
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentStatus = 'completed';
    payment.transactionId = razorpay_payment_id;
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'confirmed';
    booking.payment = payment._id;
    await booking.save();

    return res.json({ booking, payment });
  } catch (error) {
    console.error('verifyPayment error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get user bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking by ID (with permission check)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property user payment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.body.status) {
      booking.status = req.body.status;
    }

    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Extend booking
const extendBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const { newCheckOut } = req.body;
    const newDuration = Math.max(0, (new Date(newCheckOut).getFullYear() - new Date(booking.checkIn).getFullYear()) * 12 + (new Date(newCheckOut).getMonth() - new Date(booking.checkIn).getMonth()));

    if (newDuration <= booking.months) {
      return res.status(400).json({ message: 'New check-out must be after current check-out' });
    }

    const property = await Property.findById(booking.property);

    booking.checkOut = newCheckOut;
    booking.months = newDuration;
    booking.totalPrice = property.price.monthly * newDuration + (property.price.security || 0);

    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  extendBooking,
};
