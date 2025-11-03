const express = require('express');
const {
  getAllAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
} = require('../controllers/addOnController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getAllAddOns);
router.post('/', protect, admin, createAddOn);
router.put('/:id', protect, admin, updateAddOn);
router.delete('/:id', protect, admin, deleteAddOn);

module.exports = router;
