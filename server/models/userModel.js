const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const userSchema = new Schema(
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
		bio: {
			type: String,
			trim: true,
			maxlength: [500, "Bio cannot exceed 500 characters"],
		},
		location: {
			type: String,
			trim: true,
			maxlength: [100, "Location cannot exceed 100 characters"],
		},
		website: {
			type: String,
			trim: true,
			validate: {
				validator: function (v) {
					if (!v) return true;
					return validator.isURL(v);
				},
				message: "Please provide a valid URL",
			},
		},
		birthday: Date,
		occupation: {
			type: String,
			trim: true,
			maxlength: [100, "Occupation cannot exceed 100 characters"],
		},
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
	},
	{
		timestamps: true,
	}
);

// Add passwordConfirm as a virtual - it will not be saved to the database
userSchema
	.virtual("passwordConfirm")
	.get(function () {
		return this._passwordConfirm;
	})
	.set(function (value) {
		this._passwordConfirm = value;
	});

// Add validation for password confirmation
userSchema.pre("validate", function (next) {
	if (this.isNew || this.isModified("password")) {
		if (this._passwordConfirm !== this.password) {
			this.invalidate("passwordConfirm", "Passwords do not match");
		}
	}
	next();
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.pre("save", function (next) {
	if (!this.isModified("password") || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
	const payload = {
		id: this._id,
		email: this.email,
	};

	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);

		return JWTTimestamp < changedTimestamp;
	}

	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
