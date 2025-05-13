const User = require("../models/userModel");
const { sendToken } = require("./authController");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const { sendError, sendSuccess } = require("../utils/responseUtils");

exports.getMe = (req, res) => {
	const user = req.user;
	if (!user) {
		return sendError(res, 500, "Oops, something went wrong!");
	}
	return sendSuccess(res, 200, "User profile retrieved successfully", {
		data: { user },
	});
};

exports.updateMe = async (req, res) => {
	try {
		if (req.body.password || req.body.passwordConfirm) {
			return sendError(
				res,
				400,
				"This route is not for password updates. Please use /update-password."
			);
		}

		const allowedFields = [
			"username",
			"fullName",
			"profilePicture",
			"email",
			"bio",
			"location",
			"website",
			"birthday",
		];
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
				return sendError(res, 400, "Email is already in use");
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

		return sendSuccess(res, 200, "User has been updated successfully", {
			data: { user: updatedUser },
		});
	} catch (error) {
		return sendError(
			res,
			500,
			"Something went wrong while updating user, try again later"
		);
	}
};

exports.updatePassword = async (req, res) => {
	const { passwordCurrent, password, passwordConfirm } = req.body;

	if (!passwordCurrent || !password || !passwordConfirm) {
		return sendError(
			res,
			400,
			"Please provide current password, new password and password confirmation"
		);
	}

	if (password !== passwordConfirm) {
		return sendError(res, 400, "New passwords do not match");
	}

	try {
		const user = await User.findById(req.user._id).select("+password");

		if (!(await user.comparePassword(passwordCurrent))) {
			return sendError(res, 401, "Your current password is incorrect");
		}

		user.password = password;
		user.passwordConfirm = passwordConfirm; // This will use the virtual setter
		await user.save();

		sendToken(user, 200, res);
	} catch (err) {
		return sendError(res, 500, "Error updating password", {
			error: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
};

exports.updateProfilePicture = async (req, res) => {
	try {
		if (!req.files || !req.files.length) {
			return sendError(res, 400, "Please upload an image file");
		}

		const user = req.user;
		const file = req.files[0];

		const result = await cloudinary.uploader.upload(file.path, {
			folder: `users/${user._id}/profile`,
			width: 500,
			height: 500,
			crop: "fill",
		});

		if (user.profilePicture) {
			try {
				const urlParts = user.profilePicture.split("/");
				const publicIdIndex = urlParts.indexOf("profile") + 1;

				if (publicIdIndex < urlParts.length) {
					const publicIdWithExtension = urlParts[publicIdIndex];
					const publicId = publicIdWithExtension.split(".")[0];

					if (publicId) {
						await cloudinary.uploader.destroy(
							`users/${user._id}/profile/${publicId}`
						);
					}
				}
			} catch (deleteError) {
				console.error("Error deleting old profile picture:", deleteError);
			}
		}

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ profilePicture: result.secure_url },
			{ new: true, runValidators: true }
		);
		fs.unlinkSync(file.path);

		return sendSuccess(res, 200, "Profile picture updated successfully", {
			data: { user: updatedUser },
		});
	} catch (error) {
		console.error("Profile picture update error:", error);

		// Clean up any uploaded files
		if (req.files && req.files.length > 0) {
			req.files.forEach((file) => {
				try {
					if (fs.existsSync(file.path)) {
						fs.unlinkSync(file.path);
					}
				} catch (unlinkError) {
					console.error("Error removing temporary file:", unlinkError);
				}
			});
		}

		return sendError(res, 500, "Error updating profile picture", {
			error:
				process.env.NODE_ENV === "development" ? error.message : "Server error",
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

		return sendSuccess(res, 200, "Profile information updated successfully", {
			data: { user: updatedUser },
		});
	} catch (error) {
		return sendError(
			res,
			500,
			"Something went wrong while updating profile information, try again later",
			{
				error:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			}
		);
	}
};

exports.getUserById = async (req, res) => {
	try {
		const userId = req.params.id;

		const user = await User.findById(userId).select(
			"-__v -passwordChangedAt -passwordResetToken -passwordResetExpires"
		);

		if (!user) {
			return sendError(res, 404, "User not found");
		}

		return sendSuccess(res, 200, "User profile retrieved successfully", {
			data: { user },
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving user profile", {
			error:
				process.env.NODE_ENV === "development" ? error.message : "Server error",
		});
	}
};

exports.deleteProfilePicture = async (req, res) => {
	try {
		const user = req.user;

		// If user has a profile picture, delete it from Cloudinary
		if (user.profilePicture) {
			try {
				const urlParts = user.profilePicture.split("/");
				const publicIdIndex = urlParts.indexOf("profile") + 1;

				if (publicIdIndex < urlParts.length) {
					const publicIdWithExtension = urlParts[publicIdIndex];
					const publicId = publicIdWithExtension.split(".")[0];

					if (publicId) {
						await cloudinary.uploader.destroy(
							`users/${user._id}/profile/${publicId}`
						);
					}
				}
			} catch (deleteError) {
				console.error(
					"Error deleting profile picture from storage:",
					deleteError
				);
			}
		}

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ profilePicture: null },
			{ new: true, runValidators: true }
		);

		return sendSuccess(res, 200, "Profile picture removed successfully", {
			data: { user: updatedUser },
		});
	} catch (error) {
		return sendError(res, 500, "Error removing profile picture", {
			error:
				process.env.NODE_ENV === "development" ? error.message : "Server error",
		});
	}
};
