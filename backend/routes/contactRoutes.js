const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { contactOwner } = require('../controllers/contactController');

// POST /api/contact - protected
router.post('/', protect, contactOwner);

module.exports = router;
