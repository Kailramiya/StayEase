const express = require('express');
const {
  register,
  login,
  getMe,
  updateMe,
  uploadProfilePicture,
  removeProfilePicture,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
// Helper to call multer and capture errors so we can return clearer messages when upload fails
const uploadSingleSafe = (fieldName) => (req, res, next) => {
  // Log incoming headers to help debug missing file issues
  console.log('Upload request headers:', {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    origin: req.headers['origin'],
  });

  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      // Multer error — return JSON with code/message
      console.error('Multer upload error:', err);
      const message = err.message || 'File upload failed';
      const code = err.code || 'UPLOAD_ERROR';
      return res.status(400).json({ message, code });
    }
    next();
  });
};

// Upload single file field name: profilePicture (wrapped to handle multer errors)
router.post('/upload-profile-picture', protect, uploadSingleSafe('profilePicture'), uploadProfilePicture);
router.delete('/profile-picture', protect, removeProfilePicture);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/logout', logout);

module.exports = router;
