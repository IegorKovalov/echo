const Post = require("../models/postModel");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// Add standardized error handler
const sendError = (res, statusCode, message) => {
	return res.status(statusCode).json({
		status: "failed",
		message,
	});
};

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
		console.log(req.body);
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
		postData.media = [];
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const result = await cloudinary.uploader.upload(file.path, {
					resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
					folder: "posts",
				});
				postData.media.push({
					url: result.secure_url,
					type: file.mimetype.startsWith("video/") ? "video" : "image",
				});
				fs.unlinkSync(file.path); // Remove temp file
			}
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
		const { includeExpired, page = 1, limit = 15 } = req.query;

		const pageNumber = parseInt(page, 10);
		const limitNumber = parseInt(limit, 10);

		const skip = (pageNumber - 1) * limitNumber;

		let query = Post.find({ user: userId });

		if (includeExpired === "true") {
			query = query.where({ includeExpired: true });
		}

		const totalPosts = await Post.countDocuments(query.getQuery());
		const hasMorePosts = pageNumber * limitNumber < totalPosts;

		query = query.skip(skip).limit(limitNumber).sort({ createdAt: -1 });

		const posts = await populatePostFields(query);

		const enhancedPosts = posts.map((post) => {
			const postObj = post.toObject({ virtuals: true });
			postObj.isExpired = post.isExpired;
			postObj.remainingTime = post.remainingTime;
			postObj.expirationProgress = post.expirationProgress;
			return postObj;
		});

		res.status(200).json({
			status: "success",
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
				pagination: {
					total: totalPosts,
					currentPage: pageNumber,
					postsPerPage: limitNumber,
					totalPages: Math.ceil(totalPosts / limitNumber),
					hasMore: hasMorePosts,
					nextPage: hasMorePosts ? pageNumber + 1 : null,
				},
			},
		});
	} catch (error) {
		sendError(res, 500, "Error retrieving user posts");
	}
};

exports.getAllPosts = async (req, res) => {
	try {
		console.log("getAllPosts controller called with params:", req.query);
		const {
			page = 1,
			limit = 10,
			includeExpired = false,
			sortBy = "-createdAt",
		} = req.query;

		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);
		const skip = (pageNum - 1) * limitNum;

		// Build the query
		let query = {};

		// Only include non-expired posts unless specifically requested
		if (includeExpired !== "true") {
			query.expiresAt = { $gt: new Date() };
		}

		console.log("Using query filter:", JSON.stringify(query));
		console.log(`Pagination: page=${pageNum}, limit=${limitNum}, skip=${skip}`);

		// Count total matching documents first
		const totalPosts = await Post.countDocuments(query);
		console.log(`Total posts matching query: ${totalPosts}`);

		// Execute the query with pagination
		const posts = await Post.find(query)
			.skip(skip)
			.limit(limitNum)
			.sort(sortBy)
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			.populate({
				path: "comments.user",
				select: "username fullName profilePicture",
			});

		console.log(`Found ${posts.length} posts for page ${pageNum}`);

		// Check if there are actually more posts
		const hasMorePosts = totalPosts > pageNum * limitNum;

		// Apply virtual properties to each post
		const enhancedPosts = posts.map((post) => {
			const postObj = post.toObject({ virtuals: true });
			postObj.isExpired = post.isExpired;
			postObj.remainingTime = post.remainingTime;
			postObj.expirationProgress = post.expirationProgress;
			return postObj;
		});

		const responseObj = {
			status: "success",
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
				pagination: {
					total: totalPosts,
					currentPage: pageNum,
					postsPerPage: limitNum,
					totalPages: Math.ceil(totalPosts / limitNum),
					hasMore: hasMorePosts,
					nextPage: hasMorePosts ? pageNum + 1 : null,
				},
			},
		};

		console.log(
			"Sending response with structure:",
			JSON.stringify(
				{
					status: responseObj.status,
					data: {
						count: responseObj.data.count,
						pagination: responseObj.data.pagination,
					},
				},
				null,
				2
			)
		);

		res.status(200).json(responseObj);
	} catch (error) {
		console.error("Error in getAllPosts controller:", error);
		sendError(res, 500, "Failed to retrieve posts");
	}
};

exports.getPost = async (req, res) => {
	try {
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
		const content = req.body.content;
		const duration = req.body.duration;
		const keepExistingImage = req.body.keepExistingImage;
		const existingMediaIds = req.body.existingMediaIds;

		if (!content || content.trim() === "") {
			return res.status(400).json({
				status: "failed",
				message: "Post content is required",
			});
		}
		const post = await Post.findOne({
			_id: req.params.id,
			user: req.user._id,
		});

		if (!post) {
			return res.status(404).json({
				status: "failed",
				message: "Post not found or you're not authorized to update it",
			});
		}
		post.content = content.trim();
		if (duration) {
			const durationHours = parseFloat(duration);
			if (!isNaN(durationHours) && durationHours > 0 && durationHours <= 168) {
				const now = new Date();
				post.expiresAt = new Date(
					now.getTime() + durationHours * 60 * 60 * 1000
				);
			}
		}

		// Handle media updates
		if (req.files && req.files.length > 0) {
			// If new files are uploaded, handle existing media differently
			if (
				existingMediaIds &&
				Array.isArray(existingMediaIds) &&
				existingMediaIds.length > 0
			) {
				// Keep only the media items that match the existingMediaIds
				const mediaToKeep = post.media.filter((item) =>
					existingMediaIds.includes(item._id.toString())
				);

				// Delete media items not in existingMediaIds from Cloudinary
				const mediaToDelete = post.media.filter(
					(item) => !existingMediaIds.includes(item._id.toString())
				);

				for (const mediaItem of mediaToDelete) {
					try {
						if (mediaItem.publicId) {
							await cloudinary.uploader.destroy(mediaItem.publicId, {
								resource_type: mediaItem.type,
							});
						}
					} catch (err) {
						console.error("Error deleting Cloudinary media:", err);
					}
				}

				// Update post media to keep existing selected media
				post.media = mediaToKeep;
			} else {
				// Delete all old media from Cloudinary if not specified to keep
				if (post.media && post.media.length > 0) {
					for (const mediaItem of post.media) {
						try {
							if (mediaItem.publicId) {
								await cloudinary.uploader.destroy(mediaItem.publicId, {
									resource_type: mediaItem.type,
								});
							}
						} catch (err) {
							console.error("Error deleting Cloudinary media:", err);
						}
					}
				}
				post.media = [];
			}

			// Add new media uploads
			for (const file of req.files) {
				const result = await cloudinary.uploader.upload(file.path, {
					resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
					folder: "posts",
				});
				post.media.push({
					url: result.secure_url,
					type: file.mimetype.startsWith("video/") ? "video" : "image",
					publicId: result.public_id,
				});
				fs.unlinkSync(file.path); // Remove temp file
			}
		} else if (existingMediaIds && Array.isArray(existingMediaIds)) {
			// No new files, but user might have removed some existing media
			if (existingMediaIds.length > 0) {
				// Keep only the media items that match the existingMediaIds
				const mediaToKeep = post.media.filter((item) =>
					existingMediaIds.includes(item._id.toString())
				);

				// Delete media items not in existingMediaIds from Cloudinary
				const mediaToDelete = post.media.filter(
					(item) => !existingMediaIds.includes(item._id.toString())
				);

				for (const mediaItem of mediaToDelete) {
					try {
						if (mediaItem.publicId) {
							await cloudinary.uploader.destroy(mediaItem.publicId, {
								resource_type: mediaItem.type,
							});
						}
					} catch (err) {
						console.error("Error deleting Cloudinary media:", err);
					}
				}

				post.media = mediaToKeep;
			} else if (existingMediaIds.length === 0) {
				// All media was removed
				// Delete all media from Cloudinary
				if (post.media && post.media.length > 0) {
					for (const mediaItem of post.media) {
						try {
							if (mediaItem.publicId) {
								await cloudinary.uploader.destroy(mediaItem.publicId, {
									resource_type: mediaItem.type,
								});
							}
						} catch (err) {
							console.error("Error deleting Cloudinary media:", err);
						}
					}
				}
				post.media = [];
			}
		} else if (keepExistingImage === "false") {
			// Delete all media if keepExistingImage is false and no existingMediaIds provided
			if (post.media && post.media.length > 0) {
				for (const mediaItem of post.media) {
					try {
						if (mediaItem.publicId) {
							await cloudinary.uploader.destroy(mediaItem.publicId, {
								resource_type: mediaItem.type,
							});
						}
					} catch (err) {
						console.error("Error deleting Cloudinary media:", err);
					}
				}
			}
			post.media = [];
		}

		await post.save({ timestamps: false });
		const updatedPost = await populatePostFields(Post.findById(post._id));
		const postObj = updatedPost.toObject({ virtuals: true });
		postObj.isExpired = updatedPost.isExpired;
		postObj.remainingTime = updatedPost.remainingTime;
		postObj.expirationProgress = updatedPost.expirationProgress;

		res.status(200).json({
			status: "success",
			data: {
				post: postObj,
			},
		});
	} catch (error) {
		console.error("Error updating post:", error);
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

		// Enhance post with virtual properties
		const postObj = post.toObject({ virtuals: true });
		postObj.isExpired = post.isExpired;
		postObj.remainingTime = post.remainingTime;
		postObj.expirationProgress = post.expirationProgress;

		res.status(200).json({
			status: "success",
			data: {
				post: postObj,
				message: "Comment deleted successfully",
			},
		});
	} catch (error) {
		sendError(res, 500, "Error deleting comment");
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

// Increment the views counter for a post
exports.incrementViews = async (req, res) => {
	try {
		const post = await Post.findByIdAndUpdate(
			req.params.id,
			{ $inc: { views: 1 } },
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
				views: post.views,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error updating post views",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Batch increment views for multiple posts
exports.batchIncrementViews = async (req, res) => {
	try {
		const { postIds } = req.body;

		if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
			return res.status(400).json({
				status: "failed",
				message: "Valid postIds array is required",
			});
		}

		// Update the view count for all posts in a single operation
		const result = await Post.updateMany(
			{ _id: { $in: postIds } },
			{ $inc: { views: 1 } }
		);

		res.status(200).json({
			status: "success",
			data: {
				modifiedCount: result.modifiedCount,
				message: `Updated views for ${result.modifiedCount} posts`,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "failed",
			message: "Error updating post views in batch",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get trending posts based on views and recency
exports.getTrendingPosts = async (req, res) => {
	try {
		// Calculate date 48 hours ago for trending window
		const trendingWindow = new Date(Date.now() - 48 * 60 * 60 * 1000);

		// Find non-expired posts created within the trending window
		const posts = await Post.find({
			createdAt: { $gte: trendingWindow },
			expiresAt: { $gt: new Date() }, // Only non-expired posts
		})
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			// Sort by views and creation date only (removed likes)
			.sort({ views: -1, createdAt: -1 })
			.limit(5); // Get top 5 trending posts

		// Enhance posts with virtual properties
		const enhancedPosts = posts.map((post) => {
			const postObj = post.toObject({ virtuals: true });
			postObj.isExpired = post.isExpired;
			postObj.remainingTime = post.remainingTime;
			postObj.expirationProgress = post.expirationProgress;
			return postObj;
		});

		res.status(200).json({
			status: "success",
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
			},
		});
	} catch (error) {
		sendError(res, 500, "Error retrieving trending posts");
	}
};
