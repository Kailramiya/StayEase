const express = require('express');
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrOwner } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

router.route('/:id')
  .get(getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

router.post('/:id/images', protect, upload.array('images'), uploadPropertyImages);

module.exports = router;
