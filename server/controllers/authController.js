const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const sendEmail = require("../utils/email/email");
const User = require("../models/userModel");
const resetPasswordMessage = require("../utils/email/templates/passwordReset");
const otpEmailTemplate = require("../utils/email/templates/otpEmail");
const { sendError, sendSuccess } = require("../utils/http/responseUtils");

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

	return sendSuccess(res, statusCode, "Authentication successful", {
		token,
		data: { user },
	});
};

exports.sendToken = sendToken;

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return sendError(res, 400, "Please provide email and password");
		}

		const user = await User.findOne({ email }).select("+password");

		if (!user || !(await user.comparePassword(password))) {
			return sendError(
				res,
				401,
				"Invalid credentials, email or password are incorrect"
			);
		}

		if (!user.isVerified) {
			return sendError(
				res,
				403,
				"Email not verified. Please verify your email to continue.",
				{
					userId: user._id,
				}
			);
		}

		return sendToken(user, 200, res);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "An error occurred during login");
	}
};

exports.signup = async (req, res) => {
  
  try {
    const {
      username,
      email,
      password,
      passwordConfirm,
      fullName,
      profilePicture,
    } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return sendError(res, 400, "Email already in use");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return sendError(res, 400, "Username already taken");
    }

    const user = await User.create({
      username,
      email,
      password,
      passwordConfirm,
      fullName,
      profilePicture,
      isVerified: false,
    });

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    try {
      const message = otpEmailTemplate(otp, user.fullName || user.username);
      await sendEmail({
        email: user.email,
        subject: "Your Email Verification Code",
        message,
      });

      return sendSuccess(
        res,
        201,
        "Signup successful! Please check your email for verification code.",
        {
          userId: user._id,
        }
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return sendSuccess(
        res,
        201,
        "Account created but failed to send verification email. Please use the resend option.",
        {
          status: "partial_success",
          userId: user._id,
        }
      );
    }
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.logout = (req, res) => {
	const cookieOptions = {
		expires: new Date(0),
		httpOnly: true,
		path: "/",
		sameSite: "strict",
	};
	res.clearCookie("jwt", cookieOptions);

	return sendSuccess(res, 200, "Logout successful");
};

exports.forgotPassword = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return sendError(res, 400, "Please provide an email address");
	}

	const user = await User.findOne({ email });

	if (!user) {
		return sendError(res, 404, "No user with that email address exists");
	}

	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

	const message = resetPasswordMessage(resetURL);
	try {
		await sendEmail({
			email: user.email,
			subject: "Your Password Reset Request (valid for 10 min)",
			message,
		});

		return sendSuccess(res, 200, "Token sent to email!");
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return sendError(
			res,
			500,
			"There was an error sending the email. Try again later!"
		);
	}
};

exports.resetPassword = async (req, res) => {
	const resetToken = req.params.token;
	const hashedToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	try {
		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user) {
			return sendError(res, 404, "Token is invalid or has expired");
		}

		const { password, passwordConfirm } = req.body;

		if (!password || !passwordConfirm) {
			return sendError(
				res,
				400,
				"Please provide password and password confirmation"
			);
		}

		if (password.length < 8) {
			return sendError(res, 400, "Password must be at least 8 characters");
		}

		if (password !== passwordConfirm) {
			return sendError(res, 400, "Passwords do not match");
		}

		user.passwordResetExpires = undefined;
		user.passwordResetToken = undefined;
		user.passwordChangedAt = Date.now();
		user.password = password;
		user.passwordConfirm = passwordConfirm;
		await user.save();

		return sendToken(user, 200, res);
	} catch (err) {
		return sendError(res, 500, err.message);
	}
};

exports.protect = async (req, res, next) => {
	try {
		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return sendError(
				res,
				401,
				"You are not logged in! Please log in to get access"
			);
		}

		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const freshUser = await User.findById(decoded.id);

		if (!freshUser) {
			return sendError(
				res,
				401,
				"The user belonging to this token no longer exists."
			);
		}

		if (freshUser.changedPasswordAfter(decoded.iat)) {
			return sendError(
				res,
				401,
				"User recently changed password! Please log in again."
			);
		}

		req.user = freshUser;
		res.locals.user = freshUser;
		next();
	} catch (err) {
		return sendError(res, 401, "Invalid token or token expired");
	}
};

exports.requireVerification = async (req, res, next) => {
	try {
		const user = req.user;

		if (!user.isVerified) {
			return sendError(
				res,
				403,
				"Your email is not verified. Please verify your email to access this resource.",
				{
					userId: user._id,
				}
			);
		}

		next();
	} catch (err) {
		return sendError(res, 500, "Error checking verification status");
	}
};

exports.isLoggedIn = async (req, res, next) => {
	try {
		let token;
		if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return next();
		}

		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return next();
		}

		if (currentUser.changedPasswordAfter(decoded.iat)) {
			return next();
		}

		req.user = currentUser;
		res.locals.user = currentUser;
		return next();
	} catch (err) {
		return next();
	}
};
