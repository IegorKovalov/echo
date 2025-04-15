// Create a new file: server/controllers/userController.js
const User = require("../models/userModel");
const { sendToken } = require("./authController");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

exports.getMe = (req, res) => {
	const user = req.user;
	if (!user) {
		return res.status(500).json({
			status: "failed",
			message: "Oops, something went wrong!",
		});
	}
	res.status(200).json({
		status: "success",
		data: {
			user,
		},
	});
};

exports.updateMe = async (req, res) => {
	try {
		if (req.body.password || req.body.passwordConfirm) {
			return res.status(400).json({
				status: "failed",
				message:
					"This route is not for password updates. Please use /update-password.",
			});
		}
		const allowedFields = ["username", "fullName", "profilePicture", "email"];
		const filteredBody = {};
		Object.keys(req.body).forEach((field) => {
			if (allowedFields.includes(field)) {
				filteredBody[field] = req.body[field];
			}
		});
		if (filteredBody.email !== req.user.email) {
			const result = await User.findOne({
				email: {
					$eq: filteredBody.email,
				},
				_id: {
					$ne: req.user._id,
				},
			});
			if (result) {
				return res.status(400).json({
					status: "failed",
					message: "Email is already in used",
				});
			}
		}
		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			filteredBody,
			{
				new: true,
				runValidators: true,
			}
		);
		res.status(200).json({
			status: "success",
			message: "User has been updates successfully",
			data: {
				user: updatedUser,
			},
		});
	} catch (error) {
		return res.status(500).json({
			status: "failed",
			message: "Something went wrong will updating user, try again later",
		});
	}
};

exports.updatePassword = async (req, res) => {
	const { passwordCurrent, password, passwordConfirm } = req.body;

	if (!passwordCurrent || !password || !passwordConfirm) {
		return res.status(400).json({
			status: "failed",
			message:
				"Please provide current password, new password and password confirmation",
		});
	}

	if (password !== passwordConfirm) {
		return res.status(400).json({
			status: "failed",
			message: "New passwords do not match",
		});
	}

	try {
		const user = await User.findById(req.user._id).select("+password");

		if (!(await user.comparePassword(passwordCurrent))) {
			return res.status(401).json({
				status: "failed",
				message: "Your current password is incorrect",
			});
		}

		user.password = password;
		user.passwordConfirm = passwordConfirm;
		await user.save();

		sendToken(user, 200, res);
	} catch (err) {
		return res.status(500).json({
			status: "failed",
			message: "Error updating password",
			error: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
};

exports.updateProfilePicture = async (req, res) => {
	try {
		// Check if a file was uploaded
		if (!req.file) {
			return res.status(400).json({
				status: "failed",
				message: "Please upload an image file",
			});
		}

		// Get current user
		const user = req.user;

		// Upload to cloudinary
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: `users/${user._id}/profile`,
			width: 500,
			height: 500,
			crop: "fill",
		});

		// Delete old profile picture from Cloudinary if exists
		if (user.profilePicture) {
			const publicId = user.profilePicture.split("/").pop().split(".")[0];
			if (publicId) {
				await cloudinary.uploader.destroy(
					`users/${user._id}/profile/${publicId}`
				);
			}
		}

		// Update user with new profile picture URL
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ profilePicture: result.secure_url },
			{ new: true, runValidators: true }
		);

		// Delete temporary file
		fs.unlinkSync(req.file.path);

		// Return success response
		res.status(200).json({
			status: "success",
			message: "Profile picture updated successfully",
			data: {
				user: updatedUser,
			},
		});
	} catch (error) {
		if (req.file) {
			fs.unlinkSync(req.file.path);
		}

		return res.status(500).json({
			status: "failed",
			message: "Error updating profile picture",
			error: error.message,
		});
	}
};
exports.updateProfileInfo = async (req, res) => {
	try {
		const allowedFields = [
			"bio",
			"location",
			"website",
			"birthday",
			"occupation",
		];
		const filteredBody = {};

		Object.keys(req.body).forEach((field) => {
			if (allowedFields.includes(field)) {
				filteredBody[field] = req.body[field];
			}
		});

		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			filteredBody,
			{
				new: true,
				runValidators: true,
			}
		);

		res.status(200).json({
			status: "success",
			message: "Profile information updated successfully",
			data: {
				user: updatedUser,
			},
		});
	} catch (error) {
		return res.status(500).json({
			status: "failed",
			message:
				"Something went wrong while updating profile information, try again later",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};
