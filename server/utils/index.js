/**
 * Echo Server Utilities
 * Centralized export for all utility functions
 */

// Media utilities
const mediaUtils = require('./media/mediaUtils');
const mediaCompressor = require('./media/mediaCompressor');
const cloudinary = require('./media/cloudinary');

// Email utilities
const sendEmail = require('./email/email');
const passwordResetTemplate = require('./email/templates/passwordReset');
const otpEmailTemplate = require('./email/templates/otpEmail');

// HTTP utilities
const { sendError, sendSuccess } = require('./http/responseUtils');

// Post utilities
const postUtils = require('./post/postUtils');

module.exports = {
  // Media
  mediaUtils,
  mediaCompressor,
  cloudinary,
  
  // Email
  sendEmail,
  emailTemplates: {
    passwordReset: passwordResetTemplate,
    otpEmail: otpEmailTemplate
  },
  
  // HTTP
  responseUtils: {
    sendError,
    sendSuccess
  },
  
  // Post
  postUtils
}; 