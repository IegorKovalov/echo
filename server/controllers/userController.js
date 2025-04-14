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
	const { currentPassword, newPassword, confirmPassword } = req.body;
	if (!currentPassword || !newPassword || !confirmPassword) {
		return res.status(400).json({
			status: "failed",
			message: "Please provide password and password confirmation",
		});
	}
	if (newPassword !== confirmPassword) {
		return res.status(400).json({
			status: "failed",
			message: "password does not match",
		});
	}
	try {
		const user = await User.findOne({ _id: req.user._id }).select("+password");
		if (!(await user.comparePassword(currentPassword))) {
			return res.status(400).json({
				status: "failed",
				message: "current password is invalid, try again",
			});
		}
		user.passwordChangedAt = Date.now();
		user.password = newPassword;
		user.passwordConfirm = confirmPassword;
		await user.save();
		sendToken(user, 200, res);
	} catch (err) {
		return res.status(500).json({
			status: "failed",
			message: "Oops, something went wrong",
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
		// If we have a temporary file, delete it
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
