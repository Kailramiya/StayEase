const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(String(phone));
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
};
