const crypto = require("crypto");
const sendEmail = require("../utils/email");
const User = require("../models/userModel");
const resetPasswordMessage = require("../utils/passwordReset");
const sendToken = (user, statusCode, res) => {
	const token = user.generateAuthToken();
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	res.cookie("jwt", token, cookieOptions);
	user.password = undefined;
	res.status(statusCode).json({
		status: "success",
		token,
		data: { user },
	});
};
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				status: "failed",
				message: "Please provide email and password",
			});
		}

		const user = await User.findOne({ email }).select("+password");

		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({
				status: "failed",
				message: "Invalid credentials, email or password are incorrect",
			});
		}
		sendToken(user, 200, res);
	} catch (error) {
		return res.status(500).json({
			status: "failed",
			message: "An error occurred during login",
		});
	}
};

exports.signup = async (req, res) => {
	try {
		const user = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
			fullName: req.body.fullName,
			profilePicture: req.body.profilePicture,
		});
		sendToken(user, 201, res);
	} catch (err) {
		res.status(400).json({
			status: "failed",
			message: err.message,
		});
	}
};

exports.logout = (req, res) => {
	const cookieOptions = {
		expires: new Date(0),
		httpOnly: true,
	};
	res.cookie("jwt", "", cookieOptions);
	res.status(200).json({
		status: "success",
		message: "logout successful",
	});
};
exports.forgotPassword = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({
			status: "failed",
			message: "Please provide an email address",
		});
	}

	const user = await User.findOne({ email });

	if (!user) {
		return res.status(404).json({
			status: "failed",
			message: "No user with that email address exists",
		});
	}
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	const resetURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

	const message = resetPasswordMessage(resetURL);
	try {
		await sendEmail({
			email: user.email,
			subject: "Your Password Reset Request (valid for 10 min)",
			message,
		});

		res.status(200).json({
			status: "success",
			message: "Token sent to email!",
		});
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return res.status(500).json({
			status: "failed",
			message: "There was an error sending the email. Try again later!",
		});
	}
};

exports.resetPassword = async (req, res) => {
	const resetToken = req.params.token;
	const hashedToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});

	try {
		if (!user) {
			return res.status(404).json({
				status: "failed",
				message: "Token is invalid or has expired",
			});
		}
		user.passwordResetExpires = undefined;
		user.passwordResetToken = undefined;
		user.passwordChangedAt = Date.now();
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		await user.save();
		sendToken(user, 200, res);
	} catch (err) {
		return res.status(500).json({
			status: "failed",
			message: err.message,
		});
	}
};
