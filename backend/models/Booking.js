const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Please provide check-in date'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Please provide check-out date'],
    },
    // Legacy field (was required). Kept for backward compatibility but no longer required.
    months: {
      type: Number,
      required: false,
    },
    // New canonical duration field (in days)
    days: {
      type: Number,
      required: [true, 'Please provide duration in days'],
      min: [1, 'Duration must be at least 1 day'],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'paused', 'cancelled', 'completed'],
      default: 'pending',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    // Internal flag to keep property.bookingsCount idempotent per booking
    bookingsCountIncremented: {
      type: Boolean,
      default: false,
    },
    addOns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AddOn',
    }],
    notes: {
      type: String,
    },
    pauseHistory: [{
      pausedAt: Date,
      resumedAt: Date,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
