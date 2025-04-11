// Create a new file: server/controllers/userController.js
const User = require("../models/userModel");

exports.getMe = async (req, res) => {
	try {
		res.status(200).json({
			status: "success",
			data: {
				user: req.user,
			},
		});
	} catch (err) {
		res.status(500).json({
			status: "failed",
			message: "Error retrieving user profile",
		});
	}
};

exports.updateMe = async (req, res) => {
	try {
		if (req.body.password || req.body.passwordConfirm) {
			return res.status(400).json({
				status: "failed",
				message:
					"This route is not for password updates. Please use /updatePassword",
			});
		}

		const filteredBody = filterObj(req.body, "fullName", "profilePicture");

		const updatedUser = await User.findByIdAndUpdate(
			req.user.id,
			filteredBody,
			{ new: true, runValidators: true }
		);

		res.status(200).json({
			status: "success",
			data: {
				user: updatedUser,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "failed",
			message: err.message,
		});
	}
};

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};
