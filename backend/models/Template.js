const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide template name'],
    },
    propertyType: {
      type: String,
    },
    location: {
      city: String,
      state: String,
    },
    priceRange: {
      min: Number,
      max: Number,
    },
    bedrooms: Number,
    amenities: [String],
    duration: {
      type: Number,
      default: 1,
    },
    addOns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AddOn',
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
