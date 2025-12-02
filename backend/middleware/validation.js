const validator = require('validator');

const validateRegistration = (req, res, next) => {
  const { name, email, password, phone, address } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation (Must match frontend regex)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push('Password must be at least 6 characters with uppercase, lowercase, and number');
  }

  // Phone validation - UPDATED TO BE MORE PERMISSIVE
  // Allows optional +, then digits. Supports 10-15 digits.
  // This allows "010..." which the previous regex (^[1-9]) blocked.
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  
  // Or simpler digit check:
  const simplePhoneRegex = /^[\+]?\d{10,15}$/;

  if (!phone || !simplePhoneRegex.test(phone.replace(/\s/g, ''))) {
    errors.push('Please provide a valid phone number (10-15 digits)');
  }

  // Address validation
  if (!address || address.trim().length < 10) {
    errors.push('Address must be at least 10 characters long');
  }

  if (errors.length > 0) {
    // Return 400 with errors so frontend catches it
    return res.status(400).json({
      success: false,
      message: errors[0], // Send the first error message clearly
      errors: errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = { validateRegistration, validateLogin };