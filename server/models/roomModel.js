const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
	name: {
		type: String,
		required: [true, "Room name is required"],
		trim: true,
		maxlength: [100, "Room name cannot exceed 100 characters"],
	},
	description: {
		type: String,
		trim: true,
		maxlength: [500, "Room description cannot exceed 500 characters"],
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, "Room must have a creator"],
	},
	expiresAt: {
		type: Date,
		required: true,
		default: function () {
			const now = new Date();
			return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours
		},
	},
	duration: {
		type: Number,
		default: 24,
		min: [1, "Duration must be at least 1 hour"],
		max: [168, "Duration cannot exceed 168 hours (7 days)"],
	},
	isPrivate: {
		type: Boolean,
		default: false,
	},
	accessCode: {
		type: String,
		select: false,
	},
	participants: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	tags: [String],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
roomSchema.virtual("isExpired").get(function () {
	return new Date() > this.expiresAt;
});

roomSchema.virtual("remainingTime").get(function () {
	const now = new Date();
	return Math.max(0, this.expiresAt - now);
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
