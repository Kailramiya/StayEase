const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service name'],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    category: {
      type: String,
      enum: ['cleaning', 'maintenance', 'laundry', 'food', 'other'],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['one-time', 'weekly', 'monthly'],
      default: 'one-time',
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AddOn', addOnSchema);
