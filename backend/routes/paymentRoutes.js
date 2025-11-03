const express = require('express');
const {
  createOrder,
  verifyPayment,
  getPaymentById,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:id', protect, getPaymentById);

module.exports = router;
