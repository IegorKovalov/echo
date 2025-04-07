const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const hashPassword = async (req, res, next) => {
	try {
		const userPassword = req.body.password;
		const hash = await bcrypt.hash(userPassword, 10);
		req.hashedPassword = hash;
		// need to store hashedPassword on DB, DB isn't yet initialized.
		next();
	} catch (err) {
		return res.status(400).json({
			status: "failed",
			message: "bad request",
			statuscode: 400,
		});
	}
};

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

const sendToken = (res, user) => {
	const token = generateToken(user);
	return res.status(200).json({
		status: "success",
		message: "Login successful",
		statuscode: 200,
		token,
	});
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({
			status: "failed",
			message: "Please Provide email and password",
			statuscode: 400,
		});
	}
	const testPasswordHash = await bcrypt.hash("testpassword", 10);

	const fakeUser = {
		_id: "123456789",
		email: "test@test.com",
		passwordHash: testPasswordHash,
	};

	if (email !== fakeUser.email) {
		return res.status(400).json({
			status: "failed",
			message: "Invalid credentials, email or password are incorrect",
			statuscode: 400,
		});
	}

	try {
		const match = await bcrypt.compare(password, fakeUser.passwordHash);
		if (match) {
			return sendToken(res, fakeUser);
		} else {
			return res.status(400).json({
				status: "failed",
				message: "Invalid credentials, email or password are incorrect",
				statuscode: 400,
			});
		}
	} catch (error) {
		return res.status(500).json({
			status: "failed",
			message: "An error occurred during login",
			statuscode: 500,
		});
	}
};

//exports.signUp = async((req, res) => {});
