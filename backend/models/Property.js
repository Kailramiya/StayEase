const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'studio', 'pg', 'hostel'],
      required: true,
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    price: {
      monthly: {
        type: Number,
        required: [true, 'Please provide monthly rent'],
      },
      security: {
        type: Number,
        default: 0,
      },
    },
    amenities: [{
      type: String,
    }],
    images: [{
      url: String,
      public_id: String,
    }],
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    furnished: {
      type: String,
      enum: ['fully-furnished', 'semi-furnished', 'unfurnished'],
      default: 'semi-furnished',
    },
    availability: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);
