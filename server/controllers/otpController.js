const User = require("../models/userModel");
const otpEmailTemplate = require("../utils/otpEmail");
const sendEmail = require("../utils/email");
const { sendToken } = require("./authController");

exports.generateOTP = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("+otpCode +otpExpires +otpAttempts +otpLastRequest");
    
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    
    const message = otpEmailTemplate(otp, user.fullName || user.username);
    await sendEmail({
      email: user.email,
      subject: "Your Email Verification Code",
      message,
    });
    
    res.status(200).json({
      status: "success",
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("OTP generation error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Error sending verification code. Please try again later.",
    });
  }
};

/**
 * Verify OTP code provided by user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide verification code",
      });
    }
    
    const user = await User.findById(userId).select("+otpCode +otpExpires +otpAttempts +otpLastRequest");
    
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    
    if (!user.otpCode || !user.otpExpires) {
      return res.status(400).json({
        status: "failed",
        message: "No verification code found or it has expired. Please request a new one.",
      });
    }
    
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        status: "failed",
        message: "Verification code has expired. Please request a new one.",
      });
    }
    
    user.otpAttempts += 1;
    
    if (user.otpAttempts >= 5) {
      user.otpCode = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      
      return res.status(400).json({
        status: "failed",
        message: "Too many incorrect attempts. Please request a new verification code.",
      });
    }
    
    if (!user.verifyOTP(otp)) {
      await user.save({ validateBeforeSave: false });
      
      return res.status(400).json({
        status: "failed",
        message: "Invalid verification code",
        remainingAttempts: 5 - user.otpAttempts,
      });
    }
    
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });
    
    sendToken(user, 200, res);
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Error verifying code. Please try again later.",
    });
  }
};

/**
 * Resend OTP code to user's email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("+otpCode +otpExpires +otpAttempts +otpLastRequest");
    
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    
    if (user.isVerified) {
      return res.status(400).json({
        status: "failed",
        message: "User is already verified",
      });
    }
    
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    
    const message = otpEmailTemplate(otp, user.fullName || user.username);
    await sendEmail({
      email: user.email,
      subject: "Your Email Verification Code",
      message,
    });
    
    res.status(200).json({
      status: "success",
      message: "Verification code resent to your email",
    });
  } catch (error) {
    console.error("OTP resend error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Error resending verification code. Please try again later.",
    });
  }
}; 