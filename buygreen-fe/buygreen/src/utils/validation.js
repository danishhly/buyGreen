/**
 * Validation utility functions
 */

// Email validation regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation - at least 6 characters
export const passwordRegex = /^.{6,}$/;

// Phone validation - basic format (allows various formats)
export const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return { isValid: false, message: 'Email is required' };
    }
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 6)
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password, minLength = 6) => {
    if (!password || password.trim() === '') {
        return { isValid: false, message: 'Password is required' };
    }
    if (password.length < minLength) {
        return { isValid: false, message: `Password must be at least ${minLength} characters long` };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length (default: 2)
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name, minLength = 2) => {
    if (!name || name.trim() === '') {
        return { isValid: false, message: 'Name is required' };
    }
    if (name.trim().length < minLength) {
        return { isValid: false, message: `Name must be at least ${minLength} characters long` };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
        return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
        return { isValid: true, message: '' }; // Phone is optional
    }
    if (!phoneRegex.test(phone.trim())) {
        return { isValid: false, message: 'Please enter a valid phone number' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
        return { isValid: false, message: `${fieldName} is required` };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate price/number
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum value (default: 0)
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePrice = (value, min = 0) => {
    if (value === null || value === undefined || value === '') {
        return { isValid: false, message: 'Price is required' };
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
        return { isValid: false, message: 'Please enter a valid number' };
    }
    if (numValue < min) {
        return { isValid: false, message: `Price must be at least ${min}` };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate stock quantity
 * @param {string|number} value - Value to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateStock = (value) => {
    if (value === null || value === undefined || value === '') {
        return { isValid: false, message: 'Stock quantity is required' };
    }
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(numValue) || !Number.isInteger(numValue)) {
        return { isValid: false, message: 'Stock quantity must be a whole number' };
    }
    if (numValue < 0) {
        return { isValid: false, message: 'Stock quantity cannot be negative' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateUrl = (url) => {
    if (!url || url.trim() === '') {
        return { isValid: false, message: 'URL is required' };
    }
    try {
        new URL(url.trim());
        return { isValid: true, message: '' };
    } catch {
        return { isValid: false, message: 'Please enter a valid URL' };
    }
};

/**
 * Validate multiple URLs (comma-separated)
 * @param {string} urls - Comma-separated URLs
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateImageUrls = (urls) => {
    if (!urls || urls.trim() === '') {
        return { isValid: false, message: 'At least one image URL is required' };
    }
    const urlArray = urls.split(',').map(url => url.trim()).filter(url => url.length > 0);
    if (urlArray.length === 0) {
        return { isValid: false, message: 'At least one image URL is required' };
    }
    for (const url of urlArray) {
        const urlValidation = validateUrl(url);
        if (!urlValidation.isValid) {
            return { isValid: false, message: `Invalid URL: ${url}` };
        }
    }
    return { isValid: true, message: '' };
};

