const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followerSchema = new Schema(
	{
		follower: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		following: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

followerSchema.index({ follower: 1, following: 1 }, { unique: true });

followerSchema.pre("save", function (next) {
	if (this.follower.toString() === this.following.toString()) {
		next(new Error("Users cannot follow themselves"));
	} else {
		next();
	}
});

const Follower = mongoose.model("Follower", followerSchema);

module.exports = Follower;
