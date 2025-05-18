const mediaUtils = require('./media/mediaUtils');
const mediaCompressor = require('./media/mediaCompressor');
const cloudinary = require('./media/cloudinary');

const sendEmail = require('./email/email');
const passwordResetTemplate = require('./email/templates/passwordReset');
const otpEmailTemplate = require('./email/templates/otpEmail');

const { sendError, sendSuccess } = require('./http/responseUtils');

const postUtils = require('./post/postUtils');

module.exports = {
  mediaUtils,
  mediaCompressor,
  cloudinary,
  
  sendEmail,
  emailTemplates: {
    passwordReset: passwordResetTemplate,
    otpEmail: otpEmailTemplate
  },
  
  responseUtils: {
    sendError,
    sendSuccess
  },
  
  postUtils
};