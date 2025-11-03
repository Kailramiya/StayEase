const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const adminOrOwner = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.params.id || req.params.propertyId) {
    // Additional checks can be added here for owner
    // e.g., check ownership before allowing access
    return next();
  }
  res.status(403).json({ message: 'Admin or Owner access required' });
};

module.exports = { admin, adminOrOwner };
