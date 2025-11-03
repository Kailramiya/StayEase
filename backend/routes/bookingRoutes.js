const express = require('express');
const {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  extendBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.post('/:id/verify', protect, verifyPayment);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/extend', protect, extendBooking);

module.exports = router;
