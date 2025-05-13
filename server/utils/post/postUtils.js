const fs = require("fs");
const cloudinary = require("../media/cloudinary");

exports.populatePostFields = (query) => {
  return query
    .populate({
      path: "user",
      select: "username fullName profilePicture",
    })
    .populate({
      path: "comments.user",
      select: "username fullName profilePicture",
    })
    .populate({
      path: "comments.replies.user",
      select: "username fullName profilePicture",
    })
    .populate({
      path: "comments.replies.replyToUser",
      select: "username fullName profilePicture",
    });
};

exports.enhancePostWithVirtuals = (post) => {
  const postObj = post.toObject({ virtuals: true });
  postObj.isExpired = post.isExpired;
  postObj.remainingTime = post.remainingTime;
  postObj.expirationProgress = post.expirationProgress;
  return postObj;
};

/**
 * Validates expiration time in hours
 * @param {string|number} hours - Hours to validate
 * @param {number} defaultHours - Default hours if not provided
 * @returns {Object} - Validation result
 */
exports.validateExpirationTime = (hours, defaultHours = 24) => {
  const parsedHours = parseFloat(hours || defaultHours);
  
  if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 168) {
    return {
      valid: false,
      hours: defaultHours,
      message: "Expiration time must be between 1 hour and 168 hours (1 week)"
    };
  }
  
  return {
    valid: true,
    hours: parsedHours,
    message: "Valid expiration time"
  };
};

exports.calculateExpirationDate = (hours) => {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};


exports.getPaginationInfo = (page, limit, totalItems) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const totalPages = Math.ceil(totalItems / limitNum);
  const hasMore = totalItems > pageNum * limitNum;
  
  return {
    total: totalItems,
    currentPage: pageNum,
    itemsPerPage: limitNum,
    totalPages,
    hasMore,
    nextPage: hasMore ? pageNum + 1 : null,
    skip,
  };
}; 