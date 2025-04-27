const Post = require("../models/postModel");

exports.createPost = async (req, res) => {
	try {
		const { content } = req.body;
		if (!content) {
			return res.status(400).json({
				status: "failed",
				message: "Post content is required",
			});
		}
		const newPost = await Post.create({
			content,
			user: req.user._id,
		});
		res.status(201).json({
			status: "success",
			data: {
				post: newPost,
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

exports.getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			.sort({ createdAt: -1 });

		res.status(200).json({
			status: "success",
			results: posts.length,
			data: {
				posts,
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
		const post = await Post.findById(req.params.id)
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			.populate({
				path: "comments.user",
				select: "username fullName profilePicture",
			});
		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "No post found",
			});
		}

		res.status(200).json({
			status: "success",
			data: {
				post,
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

		const updatedPost = await Post.findOneAndUpdate(
			{ _id: req.params.id, user: req.user._id },
			{ content },
			{ new: true, runValidators: true }
		)
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			.populate({
				path: "comments.user",
				select: "username fullName profilePicture",
			});

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
		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json({
			status: "success",
			message: "Post deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error deleting post",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.likePost = async (req, res) => {
	try {
		const post = await Post.findByIdAndUpdate(
			req.params.id,
			{ $inc: { likes: 1 } },
			{ new: true }
		);

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found",
			});
		}

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
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found",
			});
		}

		post.likes = Math.max(0, post.likes - 1);
		await post.save();

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
		console.log(commentContent);
		if (!commentContent || commentContent.trim() === "") {
			return res.status(400).json({
				status: "failed",
				message: "Comment Content is required",
			});
		}

		const post = await Post.findById(req.params.id);

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

		await post.populate({
			path: "comments.user",
			select: "username fullName profilePicture",
		});
		console.log(post);
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
		const post = await Post.findById(req.params.postId);

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
