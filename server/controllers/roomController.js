const mongoose = require("mongoose");
const Room = require("../models/roomModel");
const Message = require("../models/messageModel");
const UserModel = require("../models/userModel");
const { sendError, sendSuccess } = require("../utils/http/responseUtils");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

/**
 * Create a new room
 * @route POST /api/v1/rooms
 */
exports.createRoom = async (req, res) => {
	try {
		const { name, description, duration, tags, maxUsers } = req.body;

		if (!name || name.trim() === "") {
			return sendError(res, 400, "Room name is required");
		}

		// Parse duration as a number
		const durationHours = parseInt(duration) || 24;

		// Calculate expiration date
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + durationHours);

		const roomData = {
			name: name.trim(),
			description: description ? description.trim() : "",
			creator: req.user._id,
			duration: durationHours,
			expiresAt,
			participants: [req.user._id],
			tags: tags || [],
			maxUsers: maxUsers ? parseInt(maxUsers) : 50,
		};

		const newRoom = await Room.create(roomData);

		return sendSuccess(res, 201, "Room created successfully", {
			data: { room: newRoom },
		});
	} catch (error) {
		return sendError(res, 500, "Error creating room", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

/**
 * Get all non-expired rooms with optional filtering
 * @route GET /api/v1/rooms
 */
exports.getRooms = async (req, res) => {
	try {
		const { page = 1, limit = 10, filter } = req.query;
		const skip = (page - 1) * limit;

		// Base query: only non-expired rooms
		let query = { expiresAt: { $gt: new Date() } };

		// Apply additional filters if specified
		if (filter === "joined") {
			query.participants = req.user._id;
		} else if (filter === "official") {
			query.isOfficial = true;
		}

		const totalRooms = await Room.countDocuments(query);
		const rooms = await Room.find(query)
			.populate({ path: "creator", select: "username" })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		return sendSuccess(res, 200, "Rooms retrieved successfully", {
			data: {
				rooms,
				totalRooms,
				totalPages: Math.ceil(totalRooms / limit),
				currentPage: parseInt(page),
				hasMore: skip + rooms.length < totalRooms,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving rooms", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

/**
 * Get a specific room by ID
 * @route GET /api/v1/rooms/:roomId
 */
exports.getRoom = async (req, res) => {
	try {
		const { roomId } = req.params;

		const room = await Room.findById(roomId);

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		if (room.isExpired) {
			return sendError(res, 410, "This room has expired");
		}

		return sendSuccess(res, 200, "Room retrieved successfully", {
			data: { room },
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving room", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

/**
 * Join a room and get anonymous identity
 * @route POST /api/v1/rooms/:roomId/join
 */
exports.joinRoom = async (req, res) => {
	try {
		const { roomId } = req.params;
		const room = await Room.findById(roomId);

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		if (room.isExpired) {
			return sendError(res, 410, "This room has expired");
		}

		// Check if user is already a member
		if (room.participants.includes(req.user._id)) {
			return sendSuccess(res, 200, "You are already a member of this room", {
				data: { room },
			});
		}

		// Check room capacity
		if (room.participants.length >= room.maxUsers) {
			return sendError(res, 400, "This room has reached its maximum capacity");
		}

		// Add user to participants
		room.participants.push(req.user._id);
		await room.save();

		// Generate anonymous identity for the user in this room
		const anonymousId = crypto
			.createHash("sha256")
			.update(`${req.user._id}-${roomId}-${Date.now()}`)
			.digest("hex")
			.substring(0, 10);

		const anonymousName = `Anonymous-${Math.floor(1000 + Math.random() * 9000)}`;

		return sendSuccess(res, 200, "Successfully joined the room", {
			data: {
				room,
				identity: {
					anonymousId,
					anonymousName,
				},
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error joining room", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

/**
 * Leave a room
 * @route DELETE /api/v1/rooms/:roomId/leave
 */
exports.leaveRoom = async (req, res) => {
	try {
		const { roomId } = req.params;
		const room = await Room.findById(roomId);

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		// Remove user from participants if they are a member
		if (room.participants.includes(req.user._id)) {
			room.participants = room.participants.filter(
				(id) => id.toString() !== req.user._id.toString()
			);
			await room.save();
		}

		return sendSuccess(res, 200, "Successfully left the room");
	} catch (error) {
		return sendError(res, 500, "Error leaving room", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

/**
 * Send a message in a room
 * @route POST /api/v1/rooms/:roomId/messages
 */
exports.sendMessage = async (req, res) => {
	try {
		const { roomId } = req.params;
		const { content, anonymousId, anonymousName } = req.body;

		// Validate message content
		if (!content || content.trim() === "") {
			return sendError(res, 400, "Message content is required");
		}

		// Verify room exists and has not expired
		const room = await Room.findById(roomId);
		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		if (room.isExpired) {
			return sendError(res, 410, "This room has expired");
		}

		// Verify user is a participant in the room
		if (!room.participants.includes(req.user._id)) {
			return sendError(res, 403, "You must join the room before sending messages");
		}

		// Create the message
		const newMessage = await Message.create({
			room: roomId,
			sender: req.user._id,
			content: content.trim(),
			anonymousId,
			anonymousName,
		});

		// Return the created message
		const populatedMessage = await Message.findById(newMessage._id)
			.populate({
				path: "sender",
				select: "username",
			})
			.exec();

		return sendSuccess(res, 201, "Message sent successfully", {
			data: { message: populatedMessage },
		});
	} catch (error) {
		return sendError(res, 500, "Error sending message", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

/**
 * Get messages for a room with pagination
 * @route GET /api/v1/rooms/:roomId/messages
 */
exports.getMessages = async (req, res) => {
	try {
		const { roomId } = req.params;
		const { page = 1, limit = 50 } = req.query;
		const skip = (page - 1) * limit;

		// Verify room exists
		const room = await Room.findById(roomId);
		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		// Verify user is a participant
		if (!room.participants.includes(req.user._id)) {
			return sendError(res, 403, "You must join the room to view messages");
		}

		// Count total messages for pagination info
		const totalMessages = await Message.countDocuments({ room: roomId });

		// Get messages with pagination, sorted by creation time (oldest first)
		const messages = await Message.find({ room: roomId })
			.sort({ createdAt: 1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate({
				path: "sender",
				select: "username",
			})
			.exec();

		return sendSuccess(res, 200, "Messages retrieved successfully", {
			data: {
				messages,
				totalMessages,
				totalPages: Math.ceil(totalMessages / limit),
				currentPage: parseInt(page),
				hasMore: skip + messages.length < totalMessages,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error retrieving messages", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.cleanupExpiredRooms = async () => {
	try {
		const now = new Date();
		const expiredRooms = await Room.find({ expiresAt: { $lt: now } });

		if (expiredRooms.length > 0) {
			const expiredRoomIds = expiredRooms.map((room) => room._id);

			await Message.deleteMany({ room: { $in: expiredRoomIds } });

			console.log(
				`Cleaned up messages from ${expiredRoomIds.length} expired rooms`
			);
		}
	} catch (error) {
		console.error("Error cleaning up expired rooms:", error);
	}
};

exports.ensureOfficialRooms = async () => {
	try {
		const officialRooms = [
			{
				name: "Mental Health Support",
				description:
					"A safe space to discuss mental health challenges anonymously",
				duration: 168, // 7 days
				maxUsers: 100,
				officialName: "Echo Team",
				isOfficial: true,
			},
			{
				name: "Career Confessions",
				description: "Share your workplace stories and career dilemmas",
				duration: 168, // 7 days
				maxUsers: 100,
				officialName: "Echo Team",
				isOfficial: true,
			},
			{
				name: "Creative Writing",
				description: "Share your writing and get anonymous feedback",
				duration: 168, // 7 days
				maxUsers: 100,
				officialName: "Echo Team",
				isOfficial: true,
			},
			{
				name: "Tech Talk",
				description: "Discuss technology without judgment or bias",
				duration: 168, // 7 days
				maxUsers: 100,
				officialName: "Echo Team",
				isOfficial: true,
			},
			{
				name: "Daily Confessions",
				description: "Share your thoughts, secrets, and confessions",
				duration: 168, // 7 days
				maxUsers: 100,
				officialName: "Echo Team",
				isOfficial: true,
			},
		];
		const existingRooms = await Room.find({ isOfficial: true });
		const existingRoomNames = existingRooms.map((room) => room.name);

		// Find the admin user for official content
		const adminUser = await UserModel.findOne({ username: "admin" });
		if (!adminUser) {
			console.log(
				"Could not find admin user for official rooms. Make sure to run cleanDB.js first."
			);
			return;
		}
		for (const roomData of officialRooms) {
			if (!existingRoomNames.includes(roomData.name)) {
				const expiresAt = new Date();
				expiresAt.setHours(expiresAt.getHours() + roomData.duration);

				await Room.create({
					...roomData,
					creator: adminUser._id,
					expiresAt,
					participants: [],
				});

				console.log(`Created official room: ${roomData.name}`);
			}
		}
		const now = new Date();
		const expiredOfficialRooms = await Room.find({
			isOfficial: true,
			expiresAt: { $lte: now },
		});

		for (const room of expiredOfficialRooms) {
			await require("../models/messageModel").deleteMany({ room: room._id });
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + room.duration);

			room.expiresAt = expiresAt;
			await room.save();

			console.log(`Reset official room: ${room.name}`);
		}

		console.log("Official rooms check completed");
	} catch (error) {
		console.error("Error ensuring official rooms:", error);
	}
};

