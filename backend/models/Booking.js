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
    months: {
      type: Number,
      required: true,
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
