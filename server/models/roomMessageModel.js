const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomMessageSchema = new Schema(
	{
		room: {
			type: Schema.Types.ObjectId,
			ref: "Room",
			required: [true, "Message must belong to a room"],
			index: true
		},
		roomMember: {
			type: Schema.Types.ObjectId,
			ref: "RoomMember",
			required: [true, "Message must have a sender"]
		},
		content: {
			type: String,
			required: [true, "Message cannot be empty"],
			trim: true,
			maxlength: [2000, "Message cannot exceed 2000 characters"]
		},
		// Allows for message formatting (plain, markdown, etc.)
		format: {
			type: String,
			enum: ["plain", "markdown"],
			default: "plain"
		},
		// For replies to other messages
		replyTo: {
			type: Schema.Types.ObjectId,
			ref: "RoomMessage",
			default: null
		},
		// Message lifecycle flags
		isEdited: {
			type: Boolean,
			default: false
		},
		editedAt: {
			type: Date,
			default: null
		},
		isDeleted: {
			type: Boolean,
			default: false
		},
		deletedAt: {
			type: Date,
			default: null
		},
		// Deletion information
		deletedBy: {
			type: Schema.Types.ObjectId,
			ref: "RoomMember",
			default: null
		},
		isAdminDeleted: {
			type: Boolean,
			default: false
		},
		// For admin messages or system notifications
		isSystem: {
			type: Boolean,
			default: false
		},
		// Metrics
		reactions: [
			{
				emoji: {
					type: String,
					required: true
				},
				roomMember: {
					type: Schema.Types.ObjectId,
					ref: "RoomMember"
				},
				createdAt: {
					type: Date,
					default: Date.now
				}
			}
		]
	},
	{
		timestamps: true
	}
);

// Index for efficiently retrieving messages for a room with pagination
roomMessageSchema.index({ room: 1, createdAt: -1 });

// Index for looking up replies
roomMessageSchema.index({ replyTo: 1 });

// Virtual for reaction counts by type
roomMessageSchema.virtual("reactionCounts").get(function() {
	const counts = {};
	this.reactions.forEach(reaction => {
		const emoji = reaction.emoji;
		counts[emoji] = (counts[emoji] || 0) + 1;
	});
	return counts;
});

// Method to add a reaction to a message
roomMessageSchema.methods.addReaction = function(roomMemberId, emoji) {
	// Check if this member already reacted with this emoji
	const existingReaction = this.reactions.find(
		reaction => 
			reaction.roomMember.toString() === roomMemberId.toString() && 
			reaction.emoji === emoji
	);
	
	if (existingReaction) {
		return Promise.resolve(this);
	}
	
	this.reactions.push({
		emoji,
		roomMember: roomMemberId,
		createdAt: new Date()
	});
	
	return this.save();
};

// Method to remove a reaction from a message
roomMessageSchema.methods.removeReaction = function(roomMemberId, emoji) {
	const initialLength = this.reactions.length;
	
	this.reactions = this.reactions.filter(
		reaction => 
			!(reaction.roomMember.toString() === roomMemberId.toString() && 
			reaction.emoji === emoji)
	);
	
	if (this.reactions.length !== initialLength) {
		return this.save();
	}
	
	return Promise.resolve(this);
};

// Method for admin to delete a message
roomMessageSchema.methods.adminDelete = function(adminMemberId) {
	this.isDeleted = true;
	this.isAdminDeleted = true;
	this.deletedAt = new Date();
	this.deletedBy = adminMemberId;
	this.content = "[This message has been removed by an admin]";
	return this.save();
};

// Pre-find middleware to exclude deleted messages by default
roomMessageSchema.pre(/^find/, function(next) {
	if (this.getOptions().includeDeleted !== true) {
		this.find({ isDeleted: false });
	}
	next();
});

const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema);

module.exports = RoomMessage; 