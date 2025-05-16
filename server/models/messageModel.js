const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
	room: {
		type: Schema.Types.ObjectId,
		ref: "Room",
		required: [true, "Message must belong to a room"],
	},
	content: {
		type: String,
		required: [true, "Message content is required"],
		trim: true,
		maxlength: [2000, "Message cannot exceed 2000 characters"],
	},
	sender: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, "Message must have a sender"],
		select: false,
	},
	anonymousId: {
		type: String,
		required: [true, "Anonymous identifier is required"],
	},
	anonymousName: {
		type: String,
		default: function () {
			return `Anonymous-${Math.floor(1000 + Math.random() * 9000)}`;
		},
	},
	media: [
		{
			url: { type: String },
			type: { type: String, enum: ["image", "video"] },
			publicId: { type: String },
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	reactions: {
		likes: { type: Number, default: 0 },
		dislikes: { type: Number, default: 0 },
	},
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
