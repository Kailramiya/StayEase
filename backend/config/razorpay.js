// Safe Razorpay initializer — only construct the SDK when credentials are present
const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('Razorpay keys not provided. Razorpay will be disabled. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable.');
  // Export a harmless stub to avoid runtime errors during require()
  module.exports = null;
} else {
  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  module.exports = instance;
}
