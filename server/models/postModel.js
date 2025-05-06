const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Post must belong to a user"],
		},
		content: {
			type: String,
			required: [true, "Post must have content"],
			trim: true,
		},
		media: [
			{
				url: { type: String, required: true },
				type: { type: String, enum: ["image", "video"], required: true },
				publicId: { type: String, required: true }
			}
		],
		views: {
			type: Number,
			default: 0,
		},
		comments: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				content: {
					type: String,
					required: true,
					trim: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		expiresAt: {
			type: Date,
			required: true,
			default: function () {
				const now = new Date();
				return new Date(now.getTime() + 24 * 60 * 60 * 1000);
			},
		},
		renewalCount: {
			type: Number,
			default: 0,
			max: 3,
		},
		renewedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

postSchema.virtual("commentCount").get(function () {
	return this.comments.length;
});

postSchema.virtual("isExpired").get(function () {
	return new Date() > this.expiresAt;
});

postSchema.virtual("remainingTime").get(function () {
	const now = new Date();
	const remainingMs = Math.max(0, this.expiresAt - now);
	return remainingMs;
});

postSchema.virtual("expirationProgress").get(function () {
	const totalDuration = this.renewedAt
		? this.expiresAt - this.renewedAt
		: this.expiresAt - this.createdAt;
	const elapsed = new Date() - (this.renewedAt || this.createdAt);
	return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
});

postSchema.pre(/^find/, function (next) {
	if (!this.getQuery().includeExpired) {
		this.find({ expiresAt: { $gt: new Date() } });
	}
	next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
