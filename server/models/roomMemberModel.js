const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

const roomMemberSchema = new Schema(
	{
		room: {
			type: Schema.Types.ObjectId,
			ref: "Room",
			required: [true, "Room member must belong to a room"],
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Room member must be a user"],
		},
		// Anonymous identifier shown to others in the room
		anonymousId: {
			type: String,
			required: true,
			default: function() {
				// Generate a random identifier for anonymity
				return crypto.randomBytes(8).toString("hex");
			},
		},
		// Optional nickname chosen by the user for this room
		nickname: {
			type: String,
			trim: true,
			maxlength: [30, "Nickname cannot exceed 30 characters"],
		},
		// Role in the room - only applies to user-created rooms
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
		// Moderation status
		isMuted: {
			type: Boolean,
			default: false,
		},
		muteExpiresAt: {
			type: Date,
			default: null,
		},
		isKicked: {
			type: Boolean,
			default: false,
		},
		kickedAt: {
			type: Date,
			default: null,
		},
		kickedBy: {
			type: Schema.Types.ObjectId,
			ref: "RoomMember",
			default: null,
		},
		joinedAt: {
			type: Date,
			default: Date.now,
		},
		lastActiveAt: {
			type: Date,
			default: Date.now,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Compound index to ensure a user can only be in a room once
roomMemberSchema.index({ room: 1, user: 1 }, { unique: true });

// Method to update last active timestamp
roomMemberSchema.methods.updateActivity = function() {
	this.lastActiveAt = new Date();
	return this.save();
};

// Method to generate a new anonymous identity
roomMemberSchema.methods.regenerateAnonymousId = function() {
	this.anonymousId = crypto.randomBytes(8).toString("hex");
	return this.save();
};

// Virtual to check if room member is currently online (active in last 5 minutes)
roomMemberSchema.virtual("isOnline").get(function() {
	const now = new Date();
	const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
	return this.lastActiveAt > fiveMinutesAgo && this.isActive;
});

// Virtual to check if mute has expired
roomMemberSchema.virtual("canSpeak").get(function() {
	if (!this.isMuted) return true;
	if (!this.muteExpiresAt) return false; // Permanent mute
	
	const now = new Date();
	// If mute period has expired, clear the mute status
	if (now > this.muteExpiresAt) {
		this.isMuted = false;
		this.muteExpiresAt = null;
		// No need to save here as this is just a getter
		return true;
	}
	return false;
});

// Method to mute a member for a specified duration (in minutes)
// If duration is null, mute is permanent until unmuted
roomMemberSchema.methods.mute = function(duration, adminMemberId) {
	this.isMuted = true;
	
	if (duration) {
		const now = new Date();
		this.muteExpiresAt = new Date(now.getTime() + duration * 60 * 1000);
	} else {
		this.muteExpiresAt = null; // Permanent mute
	}
	
	return this.save();
};

// Method to unmute a member
roomMemberSchema.methods.unmute = function() {
	this.isMuted = false;
	this.muteExpiresAt = null;
	return this.save();
};

// Method to kick a member from the room
roomMemberSchema.methods.kick = function(adminMemberId) {
	this.isKicked = true;
	this.isActive = false;
	this.kickedAt = new Date();
	this.kickedBy = adminMemberId;
	return this.save();
};

// Pre-find middleware to only return active and non-kicked room members by default
roomMemberSchema.pre(/^find/, function(next) {
	// Don't filter if explicitly asking for all room members
	if (this.getOptions().includeInactive !== true) {
		this.find({ isActive: true, isKicked: false });
	}
	next();
});

// Static method to find or create a room member
roomMemberSchema.statics.findOrCreate = async function(roomId, userId, isRoomCreator = false) {
	let roomMember = await this.findOne({ room: roomId, user: userId });
	
	if (!roomMember) {
		roomMember = await this.create({
			room: roomId,
			user: userId,
			role: isRoomCreator ? "admin" : "user"
		});
	} else if (!roomMember.isActive && !roomMember.isKicked) {
		// If room member exists but is inactive (and not kicked), reactivate them
		roomMember.isActive = true;
		roomMember.anonymousId = crypto.randomBytes(8).toString("hex");
		roomMember.lastActiveAt = new Date();
		await roomMember.save();
	} else if (roomMember.isKicked) {
		// If the member was kicked, they cannot rejoin
		return null;
	}
	
	return roomMember;
};

const RoomMember = mongoose.model("RoomMember", roomMemberSchema);

module.exports = RoomMember; 