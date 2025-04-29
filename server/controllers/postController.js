const Post = require("../models/postModel");

const populatePostFields = (query) => {
	return query
		.populate({
			path: "user",
			select: "username fullName profilePicture",
		})
		.populate({
			path: "comments.user",
			select: "username fullName profilePicture",
		});
};

exports.createPost = async (req, res) => {
	try {
		const { content, expirationTime } = req.body;
		if (!content) {
			return res.status(400).json({
				status: "failed",
				message: "Post content is required",
			});
		}

		const postData = { content, user: req.user._id };

		if (expirationTime) {
			const hours = parseFloat(expirationTime);
			if (isNaN(hours) || hours <= 0 || hours > 168) {
				return res.status(400).json({
					status: "failed",
					message:
						"Expiration time must be between 1 hour and 168 hours (1 week)",
				});
			}

			const now = new Date();
			postData.expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
		}

		const newPost = await Post.create(postData);

		const populatedPost = await populatePostFields(Post.findById(newPost._id));

		res.status(201).json({
			status: "success",
			data: {
				post: populatedPost,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error creating post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getUserPosts = async (req, res) => {
	try {
		const userId = req.params.userId;
		const { includeExpired } = req.query;

		let query = Post.find({ user: userId });

		if (includeExpired === "true") {
			query = query.where({ includeExpired: true });
		}

		const posts = await populatePostFields(query).sort({
			createdAt: -1,
		});

		const enhancedPosts = posts.map((post) => {
			const postObj = post.toObject({ virtuals: true });

			postObj.isExpired = post.isExpired;
			postObj.remainingTime = post.remainingTime;
			postObj.expirationProgress = post.expirationProgress;
			return postObj;
		});

		res.status(200).json({
			status: "success",
			results: enhancedPosts.length,
			data: {
				posts: enhancedPosts,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error retrieving user posts",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getAllPosts = async (req, res) => {
	try {
		const { includeExpired } = req.query;

		let query = Post.find();

		if (includeExpired === "true") {
			query = query.where({ includeExpired: true });
		}

		const posts = await populatePostFields(query).sort({ createdAt: -1 });

		const enhancedPosts = posts.map((post) => {
			const postObj = post.toObject({ virtuals: true });
			postObj.isExpired = post.isExpired;
			postObj.remainingTime = post.remainingTime;
			postObj.expirationProgress = post.expirationProgress;
			return postObj;
		});

		res.status(200).json({
			status: "success",
			results: enhancedPosts.length,
			data: {
				posts: enhancedPosts,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error retrieving posts",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getPost = async (req, res) => {
	try {
		// Use includeExpired to potentially see expired posts
		const post = await populatePostFields(
			Post.findById(req.params.id).where({ includeExpired: true })
		);

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "No post found",
			});
		}

		// Add virtual properties
		const postObj = post.toObject({ virtuals: true });
		postObj.isExpired = post.isExpired;
		postObj.remainingTime = post.remainingTime;
		postObj.expirationProgress = post.expirationProgress;

		res.status(200).json({
			status: "success",
			data: {
				post: postObj,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error retrieving post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};
exports.updatePost = async (req, res) => {
	try {
		const { content } = req.body;

		if (!content || content.trim() === "") {
			return res.status(400).json({
				status: "failed",
				message: "Post content is required",
			});
		}

		const updatedPost = await populatePostFields(
			Post.findOneAndUpdate(
				{ _id: req.params.id, user: req.user._id },
				{ content },
				{ new: true, runValidators: true }
			)
		);

		if (!updatedPost) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found or you're not authorized to update it",
			});
		}

		res.status(200).json({
			status: "success",
			data: {
				post: updatedPost,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error updating post",
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

		await post.deleteOne();
		res.status(200).json({
			status: "success",
			message: "Post deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: "failed",
			message: "Error deleting post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.likePost = async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found",
			});
		}

		if (post.likedBy.includes(req.user._id)) {
			return res.status(400).json({
				status: "failed",
				message: "You have already liked this post",
			});
		}

		post.likedBy.push(req.user._id);
		post.likes = post.likedBy.length;
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		res.status(200).json({
			status: "success",
			data: {
				post,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error liking post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.deleteLike = async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found",
			});
		}

		if (!post.likedBy.includes(req.user._id)) {
			return res.status(400).json({
				status: "failed",
				message: "You have not liked this post",
			});
		}

		post.likedBy = post.likedBy.filter(
			(userId) => userId.toString() !== req.user._id.toString()
		);
		post.likes = post.likedBy.length;
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		res.status(200).json({
			status: "success",
			data: {
				post,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error unliking post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.addComment = async (req, res) => {
	try {
		const { commentContent } = req.body;
		if (!commentContent || commentContent.trim() === "") {
			return res.status(400).json({
				status: "failed",
				message: "Comment Content is required",
			});
		}

		let post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found",
			});
		}

		const newComment = {
			user: req.user._id,
			content: commentContent.trim(),
		};

		post.comments.push(newComment);
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		res.status(201).json({
			status: "success",
			data: {
				post,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error adding comment",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.deleteComment = async (req, res) => {
	try {
		let post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found",
			});
		}

		const commentIndex = post.comments.findIndex(
			(c) =>
				c._id.toString() === req.params.commentId &&
				c.user.toString() === req.user._id.toString()
		);

		if (commentIndex === -1) {
			return res.status(403).json({
				status: "failed",
				message: "Comment not found or you're not authorized to delete it",
			});
		}

		post.comments.splice(commentIndex, 1);
		await post.save();

		post = await populatePostFields(Post.findById(post._id));

		res.status(200).json({
			status: "success",
			message: "Comment deleted",
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error deleting comment",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
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
			return res.status(404).json({
				status: "failed",
				message: "Post not found or you're not authorized to renew it",
			});
		}

		if (post.renewalCount >= 3) {
			return res.status(400).json({
				status: "failed",
				message: "Post has reached the maximum number of renewals (3)",
			});
		}

		const { hours } = req.body;
		const renewalHours = hours ? parseFloat(hours) : 24;

		if (isNaN(renewalHours) || renewalHours <= 0 || renewalHours > 168) {
			return res.status(400).json({
				status: "failed",
				message: "Renewal time must be between 1 hour and 168 hours (1 week)",
			});
		}

		const now = new Date();
		post.expiresAt = new Date(now.getTime() + renewalHours * 60 * 60 * 1000);
		post.renewalCount += 1;
		post.renewedAt = now;

		await post.save();

		const updatedPost = await populatePostFields(Post.findById(post._id));
		const postObj = updatedPost.toObject({ virtuals: true });
		postObj.isExpired = updatedPost.isExpired;
		postObj.remainingTime = updatedPost.remainingTime;
		postObj.expirationProgress = updatedPost.expirationProgress;

		res.status(200).json({
			status: "success",
			message: "Post renewed successfully",
			data: {
				post: postObj,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error renewing post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};
