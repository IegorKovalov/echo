const Post = require("../models/postModel");
const fs = require("fs");
const { sendError, sendSuccess } = require("../utils/http/responseUtils");
const {
	populatePostFields,
	enhancePostWithVirtuals,
	validateExpirationTime,
	calculateExpirationDate,
	getPaginationInfo,
} = require("../utils/post/postUtils");
const {
	uploadMediaToCloudinary,
	deleteMediaFromCloudinary,
	cleanupTempFiles,
	cleanupOldTempFiles,
} = require("../utils/media/mediaUtils");

const enhancePostsWithVirtuals = (posts) => {
	return posts.map((post) => enhancePostWithVirtuals(post));
};

exports.createPost = async (req, res) => {
	try {
		console.log("Creating post with data:", req.body);
		const { content, expirationTime } = req.body;
		if (!content) {
			return sendError(res, 400, "Post content is required");
		}

		const postData = { content, user: req.user._id };

		if (expirationTime) {
			const validation = validateExpirationTime(expirationTime);
			if (!validation.valid) {
				return sendError(res, 400, validation.message);
			}
			postData.expiresAt = calculateExpirationDate(validation.hours);
		}

		try {
			postData.media = await uploadMediaToCloudinary(req.files);
		} catch (error) {
			return sendError(res, 500, `Error uploading media: ${error.message}`);
		}

		const newPost = await Post.create(postData);
		const populatedPost = await populatePostFields(Post.findById(newPost._id));

		return sendSuccess(res, 201, "Post created successfully", {
			data: {
				post: populatedPost,
			},
		});
	} catch (error) {
		cleanupTempFiles(req.files);
		return sendError(res, 500, "Error creating post", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getUserPosts = async (req, res) => {
	try {
		const userId = req.params.userId;
		const { includeExpired, page = 1, limit = 15 } = req.query;

		const pagination = getPaginationInfo(page, limit, 0);
		let query = Post.find({ user: userId });

		if (includeExpired === "true") {
			query = query.where({ includeExpired: true });
		}

		const totalPosts = await Post.countDocuments(query.getQuery());
		query = query
			.skip(pagination.skip)
			.limit(pagination.itemsPerPage)
			.sort({ createdAt: -1 });
		const posts = await populatePostFields(query);
		const enhancedPosts = enhancePostsWithVirtuals(posts);

		return sendSuccess(res, 200, "User posts retrieved successfully", {
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
				pagination: getPaginationInfo(page, limit, totalPosts),
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving user posts");
	}
};

exports.getAllPosts = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			includeExpired = false,
			sortBy = "-createdAt",
		} = req.query;

		const pagination = getPaginationInfo(page, limit, 0);
		let query = {};

		if (includeExpired !== "true") {
			query.expiresAt = { $gt: new Date() };
		}

		const totalPosts = await Post.countDocuments(query);
		const posts = await populatePostFields(
			Post.find(query)
				.skip(pagination.skip)
				.limit(pagination.itemsPerPage)
				.sort(sortBy)
		);
		const enhancedPosts = enhancePostsWithVirtuals(posts);

		return sendSuccess(res, 200, "Posts retrieved successfully", {
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
				pagination: getPaginationInfo(page, limit, totalPosts),
			},
		});
	} catch (error) {
		console.error("Error in getAllPosts controller:", error);
		return sendError(res, 500, "Failed to retrieve posts");
	}
};

exports.getPost = async (req, res) => {
	try {
		const post = await populatePostFields(
			Post.findById(req.params.id).where({ includeExpired: true })
		);

		if (!post) {
			return sendError(res, 404, "No post found");
		}

		return sendSuccess(res, 200, "Post retrieved successfully", {
			data: {
				post: enhancePostWithVirtuals(post),
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving post", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.updatePost = async (req, res) => {
	try {
		const tempFilesToCleanup = req.files
			? req.files.map((file) => file.path)
			: [];
		const content = req.body.content;
		const duration = req.body.duration;

		let existingMediaIds = req.body.existingMediaIds;

		if (existingMediaIds === "") {
			existingMediaIds = [];
		} else if (existingMediaIds && !Array.isArray(existingMediaIds)) {
			existingMediaIds = [existingMediaIds];
		}

		if (!content || content.trim() === "") {
			cleanupTempFiles(tempFilesToCleanup);
			return sendError(res, 400, "Post content is required");
		}

		const post = await Post.findOne({
			_id: req.params.id,
			user: req.user._id,
		});

		if (!post) {
			cleanupTempFiles(tempFilesToCleanup);
			return sendError(
				res,
				404,
				"Post not found or you're not authorized to update it"
			);
		}

		post.content = content.trim();
		if (duration) {
			const validation = validateExpirationTime(duration);
			if (validation.valid) {
				post.expiresAt = calculateExpirationDate(validation.hours);
			}
		}

		// Handle existing media
		if (existingMediaIds !== undefined) {
			const mediaToKeep =
				existingMediaIds.length > 0
					? post.media.filter((item) =>
							existingMediaIds.includes(item._id.toString())
					  )
					: [];
			const mediaToDelete = post.media.filter(
				(item) => !existingMediaIds.includes(item._id.toString())
			);

			await deleteMediaFromCloudinary(mediaToDelete);
			post.media = mediaToKeep;
		}

		// Add new media
		if (req.files && req.files.length > 0) {
			try {
				const newMedia = await uploadMediaToCloudinary(req.files);
				post.media = [...post.media, ...newMedia];
			} catch (uploadError) {
				return sendError(
					res,
					500,
					`Error uploading media: ${uploadError.message}`
				);
			}
		}

		await post.save({ timestamps: false });
		const updatedPost = await populatePostFields(Post.findById(post._id));

		// Clean up any remaining temp files
		cleanupTempFiles(tempFilesToCleanup);

		return sendSuccess(res, 200, "Post updated successfully", {
			data: {
				post: enhancePostWithVirtuals(updatedPost),
			},
		});
	} catch (error) {
		console.error("Error updating post:", error);
		cleanupTempFiles(req.files);
		return sendError(res, 500, "Error updating post", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return sendError(res, 404, "Post not found");

		if (post.user.toString() !== req.user._id.toString()) {
			return sendError(res, 403, "You're not authorized to delete this post");
		}

		// Delete associated media
		await deleteMediaFromCloudinary(post.media);
		await post.deleteOne();

		// Clean up old temporary files
		cleanupOldTempFiles();

		return sendSuccess(res, 200, "Post deleted successfully");
	} catch (error) {
		return sendError(res, 500, "Error deleting post", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.addComment = async (req, res) => {
	try {
		const { commentContent } = req.body;
		if (!commentContent || commentContent.trim() === "") {
			return sendError(res, 400, "Comment Content is required");
		}

		let post = await Post.findById(req.params.id);

		if (!post) {
			return sendError(res, 404, "Post not found");
		}

		const newComment = {
			user: req.user._id,
			content: commentContent.trim(),
		};

		post.comments.push(newComment);
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		return sendSuccess(res, 201, "Comment added successfully", {
			data: {
				post,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error adding comment", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.deleteComment = async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);
		if (!post) {
			return sendError(res, 404, "Post not found");
		}

		const commentIndex = post.comments.findIndex(
			(c) =>
				c._id.toString() === req.params.commentId &&
				c.user.toString() === req.user._id.toString()
		);

		if (commentIndex === -1) {
			return sendError(
				res,
				403,
				"Comment not found or you're not authorized to delete it"
			);
		}

		post.comments.splice(commentIndex, 1);
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		return sendSuccess(res, 200, "Comment deleted successfully", {
			data: {
				post: enhancePostWithVirtuals(post),
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error deleting comment");
	}
};

exports.addCommentReply = async (req, res) => {
	try {
		const { replyContent } = req.body;

		if (!replyContent || replyContent.trim() === "") {
			return sendError(res, 400, "Reply Content is required");
		}

		let post = await Post.findById(req.params.id);
		if (!post) {
			return sendError(res, 404, "Post not found");
		}

		const commentIndex = post.comments.findIndex(
			(c) => c._id.toString() === req.params.commentId
		);

		if (commentIndex === -1) {
			return sendError(res, 404, "Comment not found");
		}

		const newReply = {
			user: req.user._id,
			content: replyContent.trim(),
			replyToUser: req.body.replyToUser || post.comments[commentIndex].user,
		};

		post.comments[commentIndex].replies =
			post.comments[commentIndex].replies || [];
		post.comments[commentIndex].replies.push(newReply);
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		return sendSuccess(res, 201, "Reply added successfully", {
			data: {
				post,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error adding reply");
	}
};

exports.deleteCommentReply = async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);
		if (!post) {
			return sendError(res, 404, "Post not found");
		}

		const comment = post.comments.find(
			(c) => c._id.toString() === req.params.commentId
		);
		if (!comment) {
			return sendError(res, 404, "Comment not found");
		}

		const replyIndex = comment.replies.findIndex(
			(r) =>
				r._id.toString() === req.params.replyId &&
				r.user.toString() === req.user._id.toString()
		);

		if (replyIndex === -1) {
			return sendError(
				res,
				403,
				"Reply not found or you're not authorized to delete it"
			);
		}

		comment.replies.splice(replyIndex, 1);
		await post.save();
		post = await populatePostFields(Post.findById(post._id));

		return sendSuccess(res, 200, "Reply deleted successfully", {
			data: {
				post,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error deleting reply");
	}
};

exports.renewPost = async (req, res) => {
	try {
		const post = await Post.findOne({
			_id: req.params.id,
			user: req.user._id,
			includeExpired: true,
		});

		if (!post) {
			return sendError(
				res,
				404,
				"Post not found or you're not authorized to renew it"
			);
		}

		if (post.renewalCount >= 3) {
			return sendError(
				res,
				400,
				"Post has reached the maximum number of renewals (3)"
			);
		}

		const { hours } = req.body;
		const validation = validateExpirationTime(hours);

		if (!validation.valid) {
			return sendError(res, 400, validation.message);
		}

		const now = new Date();
		post.expiresAt = calculateExpirationDate(validation.hours);
		post.renewalCount += 1;
		post.renewedAt = now;

		await post.save();

		const updatedPost = await populatePostFields(Post.findById(post._id));

		return sendSuccess(res, 200, "Post renewed successfully", {
			data: {
				post: enhancePostWithVirtuals(updatedPost),
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error renewing post", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.incrementViews = async (req, res) => {
	try {
		const post = await Post.findByIdAndUpdate(
			req.params.id,
			{ $inc: { views: 1 } },
			{ new: true }
		);

		if (!post) {
			return sendError(res, 404, "Post not found");
		}

		return sendSuccess(res, 200, "Post views updated successfully", {
			data: {
				views: post.views,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error updating post views", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.batchIncrementViews = async (req, res) => {
	try {
		const { postIds } = req.body;

		if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
			return sendError(res, 400, "Valid postIds array is required");
		}

		const result = await Post.updateMany(
			{ _id: { $in: postIds } },
			{ $inc: { views: 1 } }
		);

		return sendSuccess(
			res,
			200,
			`Updated views for ${result.modifiedCount} posts`,
			{
				data: {
					modifiedCount: result.modifiedCount,
				},
			}
		);
	} catch (error) {
		return sendError(res, 500, "Error updating post views in batch", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getTrendingPosts = async (req, res) => {
	try {
		const trendingWindow = new Date(Date.now() - 48 * 60 * 60 * 1000);

		const posts = await Post.find({
			createdAt: { $gte: trendingWindow },
			expiresAt: { $gt: new Date() },
		})
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			.sort({ views: -1, createdAt: -1 })
			.limit(5);

		const enhancedPosts = enhancePostsWithVirtuals(posts);

		return sendSuccess(res, 200, "Trending posts retrieved successfully", {
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving trending posts");
	}
};
