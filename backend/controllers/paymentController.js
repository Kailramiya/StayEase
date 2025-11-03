const Payment = require('../models/Payment');

const createOrder = async (req, res) => {
  // extract booking and amount from req.body
  const { bookingId, amount } = req.body;

  // Create a payment record with status = 'paid' directly (skip actual payment gateway)
  const payment = await Payment.create({
    booking: bookingId,
    amount,
    status: 'paid', // mark as paid immediately
    paidAt: Date.now(),
    transactionId: `manual_${Date.now()}`,
  });

  // Update booking status to confirmed or paid as needed

  res.status(201).json({
    status: 'success',
    data: payment,
  });
};

const verifyPayment = async (req, res) => {
  // Implement signature verification here based on Razorpay docs
  try {
    const { order_id, payment_id, signature } = req.body;

    // Verify signature and update payment status accordingly

    res.json({ message: 'Payment verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentById,
};
