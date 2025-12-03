/**
 * Authentication validation utilities
 * Provides validation functions for authentication-related data
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum password length (default: 8)
 * @param {boolean} options.requireUppercase - Require uppercase letter (default: false)
 * @param {boolean} options.requireLowercase - Require lowercase letter (default: false)
 * @param {boolean} options.requireNumber - Require number (default: false)
 * @param {boolean} options.requireSpecialChar - Require special character (default: false)
 * @returns {Object} Validation result with isValid and errors array
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  const errors = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number format (basic validation)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if phone number format is valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  // Basic phone validation - allows digits, spaces, dashes, parentheses, and +
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 10;
};

/**
 * Validate registration form data
 * @param {Object} formData - Registration form data
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateRegistration = (formData) => {
  const errors = {};

  // Full name validation
  if (!formData.full_name || formData.full_name.trim().length < 2) {
    errors.full_name = 'Full name must be at least 2 characters';
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password, { minLength: 8 });
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  // Password confirmation
  if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Passwords do not match';
  }

  // Role title validation
  if (!formData.role_title || formData.role_title.trim().length < 2) {
    errors.role_title = 'Role/Title is required';
  }

  // Phone number validation
  if (!formData.phone_number) {
    errors.phone_number = 'Phone number is required';
  } else if (!isValidPhoneNumber(formData.phone_number)) {
    errors.phone_number = 'Please enter a valid phone number';
  }

  // Timezone validation
  if (!formData.timezone) {
    errors.timezone = 'Timezone is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form data
 * @param {Object} formData - Login form data
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateLogin = (formData) => {
  const errors = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};








