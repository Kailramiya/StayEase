const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  deleteUser,
  updateUser,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getAllBookings,
} = require('../controllers/adminController');

// Protect all routes and require admin role
router.use(protect);
router.use(admin);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

// Property management
router.get('/properties', getAllProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

// Booking management
router.get('/bookings', getAllBookings);

module.exports = router;