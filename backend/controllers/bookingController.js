const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const AddOn = require('../models/AddOn');
// Razorpay removed — payments use local provider by default
const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper: compute checkOut date by adding days to checkIn
const addDaysToDate = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
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
    const { propertyId, checkIn, days, months, addOns = [], notes } = req.body;
    // Accept either days (preferred) or legacy months for backward compatibility
    const durationDays = days
      ? parseInt(days, 10)
      : months
        ? parseInt(months, 10) * 30
        : null;

    if (!propertyId || !checkIn || !durationDays) {
      return res.status(400).json({ message: 'propertyId, checkIn and days are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const checkInDate = new Date(checkIn);
    if (isNaN(checkInDate)) return res.status(400).json({ message: 'Invalid checkIn date' });

    const checkOutDate = addDaysToDate(checkInDate, durationDays);

    // Availability check
    const conflict = await hasOverlap(propertyId, checkInDate, checkOutDate);
    if (conflict) return res.status(409).json({ message: 'Property not available for selected dates' });

    // Price calculation
    const baseMonthly = property.price?.monthly || 0;
    const baseDaily = baseMonthly / 30;
    let totalPrice = baseDaily * durationDays;

    // add-ons calculation
    const addonsDocs = [];
    for (const aid of addOns) {
      const doc = await AddOn.findById(aid);
      if (doc) {
        addonsDocs.push(doc);
        if (doc.frequency === 'monthly') totalPrice += (doc.price / 30) * durationDays; // prorate monthly add-ons by days
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
      months: months ? parseInt(months, 10) : undefined, // legacy
      days: durationDays,
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
    booking.bookingsCountIncremented = true;
    await booking.save({ session });

    // After booking is confirmed: fetch related property, increment bookingsCount, save
    const propertyToUpdate = await Property.findById(propertyId).session(session);
    if (!propertyToUpdate) {
      throw new Error('Property not found');
    }
    const currentCount = Number.isFinite(propertyToUpdate.bookingsCount)
      ? propertyToUpdate.bookingsCount
      : Number(propertyToUpdate.bookingsCount) || 0;
    propertyToUpdate.bookingsCount = currentCount + 1;
    await propertyToUpdate.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ booking, paymentOrder: { provider: 'local', paid: true, amount: amountPaise } });
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error('createBooking error', error);
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/bookings/:id/verify
const verifyPayment = async (req, res) => {
  // Razorpay removed: payment verification via gateway is not available
  return res.status(501).json({ message: 'Payment gateway integration removed. No verification available.' });
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
      const prevStatus = booking.status;
      booking.status = req.body.status;

      // After booking is confirmed: increment property's bookingsCount only once per booking
      if (prevStatus !== 'confirmed' && booking.status === 'confirmed' && !booking.bookingsCountIncremented) {
        const propertyToUpdate = await Property.findById(booking.property);
        if (propertyToUpdate) {
          const currentCount = Number.isFinite(propertyToUpdate.bookingsCount)
            ? propertyToUpdate.bookingsCount
            : Number(propertyToUpdate.bookingsCount) || 0;
          propertyToUpdate.bookingsCount = currentCount + 1;
          await propertyToUpdate.save();
          booking.bookingsCountIncremented = true;
        }
      }
    }

    if (!booking.days && booking.months) {
      booking.days = booking.months * 30; // fallback for legacy records
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

    if (!booking.days && booking.months) {
      booking.days = booking.months * 30; // fallback for legacy records
    }

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
    const newCheckOutDate = new Date(newCheckOut);
    const checkInDate = new Date(booking.checkIn);

    const newDurationDays = Math.max(
      0,
      Math.ceil((newCheckOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (newDurationDays <= (booking.days || 0)) {
      return res.status(400).json({ message: 'New check-out must be after current check-out' });
    }

    const property = await Property.findById(booking.property);

    booking.checkOut = newCheckOutDate;
    booking.days = newDurationDays;
    // Keep legacy months field approximate for compatibility
    booking.months = Math.ceil(newDurationDays / 30);

    const baseMonthly = property.price?.monthly || 0;
    const baseDaily = baseMonthly / 30;
    booking.totalPrice = baseDaily * newDurationDays + (property.price?.security || 0);

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
