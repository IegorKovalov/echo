const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");

const generateToken = (user) => {
	const payload = {
		id: user._id,
		email: user.email,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
	return token;
};

const sendToken = (user, statusCode, res) => {
	const token = generateToken(user);
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
		data: {
			user,
		},
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

		if (!user || !(await bcrypt.compare(password, user.password))) {
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
