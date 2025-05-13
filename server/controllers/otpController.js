const User = require("../models/userModel");
const otpEmailTemplate = require("../utils/email/templates/otpEmail");
const sendEmail = require("../utils/email/email");
const { sendToken } = require("./authController");
const { sendError, sendSuccess } = require("../utils/http/responseUtils");

exports.generateOTP = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId).select(
			"+otpCode +otpExpires +otpAttempts +otpLastRequest"
		);

		if (!user) {
			return sendError(res, 404, "User not found");
		}

		const otp = user.generateOTP();
		await user.save({ validateBeforeSave: false });

		const message = otpEmailTemplate(otp, user.fullName || user.username);
		await sendEmail({
			email: user.email,
			subject: "Your Email Verification Code",
			message,
		});

		return sendSuccess(res, 200, "Verification code sent to your email");
	} catch (error) {
		console.error("OTP generation error:", error);
		return sendError(
			res,
			500,
			"Error sending verification code. Please try again later."
		);
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
			return sendError(res, 400, "Please provide verification code");
		}

		const user = await User.findById(userId).select(
			"+otpCode +otpExpires +otpAttempts +otpLastRequest"
		);

		if (!user) {
			return sendError(res, 404, "User not found");
		}

		if (!user.otpCode || !user.otpExpires) {
			return sendError(
				res,
				400,
				"No verification code found or it has expired. Please request a new one."
			);
		}

		if (user.otpExpires < Date.now()) {
			return sendError(
				res,
				400,
				"Verification code has expired. Please request a new one."
			);
		}

		user.otpAttempts += 1;

		if (user.otpAttempts >= 5) {
			user.otpCode = undefined;
			user.otpExpires = undefined;
			user.otpAttempts = 0;
			await user.save({ validateBeforeSave: false });

			return sendError(
				res,
				400,
				"Too many incorrect attempts. Please request a new verification code."
			);
		}

		if (!user.verifyOTP(otp)) {
			await user.save({ validateBeforeSave: false });

			return sendError(res, 400, "Invalid verification code", {
				remainingAttempts: 5 - user.otpAttempts,
			});
		}

		user.isVerified = true;
		user.otpCode = undefined;
		user.otpExpires = undefined;
		user.otpAttempts = 0;
		await user.save({ validateBeforeSave: false });

		return sendToken(user, 200, res);
	} catch (error) {
		console.error("OTP verification error:", error);
		return sendError(res, 500, "Error verifying code. Please try again later.");
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

		const user = await User.findById(userId).select(
			"+otpCode +otpExpires +otpAttempts +otpLastRequest"
		);

		if (!user) {
			return sendError(res, 404, "User not found");
		}

		if (user.isVerified) {
			return sendError(res, 400, "User is already verified");
		}

		const otp = user.generateOTP();
		await user.save({ validateBeforeSave: false });

		const message = otpEmailTemplate(otp, user.fullName || user.username);
		await sendEmail({
			email: user.email,
			subject: "Your Email Verification Code",
			message,
		});

		return sendSuccess(res, 200, "Verification code resent to your email");
	} catch (error) {
		console.error("OTP resend error:", error);
		return sendError(
			res,
			500,
			"Error resending verification code. Please try again later."
		);
	}
};
