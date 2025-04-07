const mongoose = require("mongoose");

const validator = require("validator");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters"],
			maxlength: [30, "Username cannot exceed 30 characters"],
			validate: {
				validator: function (value) {
					return /^[a-zA-Z0-9_\.]+$/.test(value);
				},
				message:
					"Username can only contain letters, numbers, underscores and periods",
			},
		},
		email: {
			type: String,
			required: [true, "Email address is required"],
			unique: true,
			lowercase: true,
			trim: true,
			validate: {
				validator: validator.isEmail,
				message: "Please provide a valid email address",
			},
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters"],
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, "Please confirm your password"],
			validate: {
				validator: function (el) {
					return el === this.password;
				},
				message: "Passwords are not the same",
			},
		},
		fullName: {
			type: String,
			required: [true, "Full name is required"],
			trim: true,
			maxlength: [100, "Full name cannot exceed 100 characters"],
			validate: {
				validator: function (value) {
					return validator.isLength(value, { min: 2, max: 100 });
				},
				message: "Full name must be between 2 and 100 characters",
			},
		},
		profilePicture: {
			type: String,
			validate: {
				validator: function (value) {
					if (!value) return true;
					return validator.isURL(value);
				},
				message: "Please provide a valid URL for profile picture",
			},
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
