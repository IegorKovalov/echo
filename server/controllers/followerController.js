const Follower = require("../models/followerModel");
const User = require("../models/userModel");
const { sendError, sendSuccess } = require("../utils/responseUtils");

exports.followUser = async (req, res) => {
	try {
		const { userId } = req.params;

		if (userId === req.user._id.toString()) {
			return sendError(res, 400, "You cannot follow yourself");
		}

		const userToFollow = await User.findById(userId);
		if (!userToFollow) {
			return sendError(res, 404, "User not found");
		}

		const existingFollow = await Follower.findOne({
			follower: req.user._id,
			following: userId,
		});

		if (existingFollow) {
			return sendError(res, 400, "You are already following this user");
		}

		const newFollower = await Follower.create({
			follower: req.user._id,
			following: userId,
		});

		return sendSuccess(res, 201, "User followed successfully", {
			data: {
				follow: newFollower,
			},
		});
	} catch (error) {
		console.error("Error in followUser:", error);
		return sendError(res, 500, "Server error while following user");
	}
};

exports.unfollowUser = async (req, res) => {
	try {
		const { userId } = req.params;

		const existingFollow = await Follower.findOne({
			follower: req.user._id,
			following: userId,
		});

		if (!existingFollow) {
			return sendError(res, 400, "You are not following this user");
		}

		await Follower.findByIdAndDelete(existingFollow._id);

		return sendSuccess(res, 200, "User unfollowed successfully");
	} catch (error) {
		console.error("Error in unfollowUser:", error);
		return sendError(res, 500, "Server error while unfollowing user");
	}
};

exports.getFollowers = async (req, res) => {
	try {
		const { userId } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		const followers = await Follower.find({ following: userId })
			.populate({
				path: "follower",
				select: "username fullName profilePicture",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const totalFollowers = await Follower.countDocuments({ following: userId });

		const enhancedFollowers = await Promise.all(
			followers.map(async (follow) => {
				const isFollowing = await Follower.exists({
					follower: req.user._id,
					following: follow.follower._id,
				});

				return {
					user: follow.follower,
					followedAt: follow.createdAt,
					isFollowing: !!isFollowing,
				};
			})
		);

		return sendSuccess(res, 200, "Followers retrieved successfully", {
			data: {
				followers: enhancedFollowers,
				count: enhancedFollowers.length,
				total: totalFollowers,
				pages: Math.ceil(totalFollowers / limit),
				currentPage: page,
				hasMore: skip + enhancedFollowers.length < totalFollowers,
			},
		});
	} catch (error) {
		console.error("Error in getFollowers:", error);
		return sendError(res, 500, "Server error while getting followers");
	}
};

exports.getFollowing = async (req, res) => {
	try {
		const { userId } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		const following = await Follower.find({ follower: userId })
			.populate({
				path: "following",
				select: "username fullName profilePicture",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const totalFollowing = await Follower.countDocuments({ follower: userId });

		const enhancedFollowing = await Promise.all(
			following.map(async (follow) => {
				const isFollowing = await Follower.exists({
					follower: req.user._id,
					following: follow.following._id,
				});

				return {
					user: follow.following,
					followedAt: follow.createdAt,
					isFollowing:
						!!isFollowing || follow.following._id.equals(req.user._id),
				};
			})
		);

		return sendSuccess(res, 200, "Following list retrieved successfully", {
			data: {
				following: enhancedFollowing,
				count: enhancedFollowing.length,
				total: totalFollowing,
				pages: Math.ceil(totalFollowing / limit),
				currentPage: page,
				hasMore: skip + enhancedFollowing.length < totalFollowing,
			},
		});
	} catch (error) {
		console.error("Error in getFollowing:", error);
		return sendError(res, 500, "Server error while getting following users");
	}
};

exports.getFollowerStats = async (req, res) => {
	try {
		const { userId } = req.params;

		const followerCount = await Follower.countDocuments({ following: userId });

		const followingCount = await Follower.countDocuments({ follower: userId });

		const isFollowing = await Follower.exists({
			follower: req.user._id,
			following: userId,
		});

		return sendSuccess(res, 200, "Follower statistics retrieved successfully", {
			data: {
				stats: {
					followers: followerCount,
					following: followingCount,
					isFollowing: !!isFollowing,
				},
			},
		});
	} catch (error) {
		console.error("Error in getFollowerStats:", error);
		return sendError(
			res,
			500,
			"Server error while getting follower statistics"
		);
	}
};

exports.getFollowingFeed = async (req, res) => {
	const Post = require("../models/postModel");
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const following = await Follower.find({ follower: req.user._id }).select(
			"following"
		);
		const followingIds = following.map((f) => f.following);

		followingIds.push(req.user._id);

		const posts = await Post.find({
			user: { $in: followingIds },
			expiresAt: { $gt: new Date() },
		})
			.populate({
				path: "user",
				select: "username fullName profilePicture",
			})
			.populate({
				path: "comments.user",
				select: "username fullName profilePicture",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		const totalPosts = await Post.countDocuments({
			user: { $in: followingIds },
			expiresAt: { $gt: new Date() },
		});

		const enhancedPosts = posts.map((post) => {
			const postObj = post.toObject({ virtuals: true });
			postObj.isExpired = post.isExpired;
			postObj.remainingTime = post.remainingTime;
			postObj.expirationProgress = post.expirationProgress;
			return postObj;
		});

		return sendSuccess(res, 200, "Feed retrieved successfully", {
			data: {
				posts: enhancedPosts,
				count: enhancedPosts.length,
				total: totalPosts,
				pages: Math.ceil(totalPosts / limit),
				currentPage: page,
				hasMore: skip + enhancedPosts.length < totalPosts,
			},
		});
	} catch (error) {
		console.error("Error in getFollowingFeed:", error);
		return sendError(res, 500, "Server error while getting feed");
	}
};
