const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Room must have a name"],
			trim: true,
			maxlength: [100, "Room name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		category: {
			type: String,
			required: [true, "Room must have a category"],
			enum: {
				values: ["Support", "Professional", "Creative", "Relationships", "Technology", "Discussion"],
				message: "Category must be one of: Support, Professional, Creative, Relationships, Technology, Discussion"
			}
		},
		roomType: {
			type: String,
			required: [true, "Room type is required"],
			enum: {
				values: ["official", "user-created"],
				message: "Room type must be either 'official' or 'user-created'"
			}
		},
		resetInterval: {
			type: Number,
			required: [true, "Reset interval is required"],
			default: function() {
				return this.roomType === "official" ? 168 : 24; // Default: 7 days for official, 1 day for user
			},
			validate: {
				validator: function(value) {
					// Official rooms must reset weekly (168 hours)
					if (this.roomType === "official" && value !== 168) {
						return false;
					}
					
					// User-created rooms can only use 24h, 72h (3 days), or 168h (7 days)
					if (this.roomType === "user-created") {
						return [24, 72, 168].includes(value);
					}
					
					return true;
				},
				message: "Reset interval must be 24 hours, 72 hours (3 days), or 168 hours (7 days)"
			}
		},
		nextResetAt: {
			type: Date,
			required: true,
			default: function() {
				const now = new Date();
				return new Date(now.getTime() + this.resetInterval * 60 * 60 * 1000);
			},
		},
		// When user-created rooms will be automatically deleted (null for official rooms)
		expiresAt: {
			type: Date,
			default: function() {
				if (this.roomType === "user-created") {
					const now = new Date();
					return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
				}
				return null;
			},
		},
		messages: [
			{
				content: {
					type: String,
					required: [true, "Message must have content"],
					trim: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
				anonymousId: {
					type: String,
					required: true,
				}
			},
		],
		participantCount: {
			type: Number,
			default: 0,
		},
		maxParticipants: {
			type: Number,
			default: function() {
				return this.roomType === "official" ? null : 100;
			},
			validate: {
				validator: function(value) {
					if (this.roomType === "official") {
						return true;
					}
					return [50, 100, 200].includes(value);
				},
				message: "User-created rooms can only have 50, 100, or 200 participants"
			}
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: function() {
				return this.roomType === "user-created";
			},
		}
	},
	{
		timestamps: true,
	}
);

// TTL index for automatic deletion of expired rooms
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual property to check if room needs reset
roomSchema.virtual("needsReset").get(function() {
	return new Date() > this.nextResetAt;
});

// Virtual property to get remaining time until reset
roomSchema.virtual("timeUntilReset").get(function() {
	const now = new Date();
	return Math.max(0, this.nextResetAt - now);
});

// Virtual property to check if room is full
roomSchema.virtual("isFull").get(function() {
	if (this.roomType === "official" || this.maxParticipants === null) {
		return false;
	}
	return this.participantCount >= this.maxParticipants;
});

// Method to reset the room (clear messages and update reset time)
roomSchema.methods.reset = function() {
	this.messages = [];
	const now = new Date();
	this.nextResetAt = new Date(now.getTime() + this.resetInterval * 60 * 60 * 1000);
	return this.save();
};

// Method to extend the expiration time for user-created rooms
roomSchema.methods.extendExpiration = function() {
	if (this.roomType === "user-created") {
		const now = new Date();
		this.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
		return this.save();
	}
	return Promise.resolve(this);
};

// Method to mark a room for deletion
roomSchema.methods.markForDeletion = function() {
	if (this.roomType === "user-created") {
		const now = new Date();
		this.expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
		return this.save();
	}
	return Promise.resolve(this);
};

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
