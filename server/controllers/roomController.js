const Room = require("../models/roomModel");
const Message = require("../models/messageModel");
const { sendError, sendSuccess } = require("../utils/http/responseUtils");
const crypto = require("crypto");

exports.createRoom = async (req, res) => {
	try {
		const { name, description, duration, isPrivate, tags } = req.body;

		if (!name || name.trim() === "") {
			return sendError(res, 400, "Room name is required");
		}

		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + (duration || 24));

		let accessCode = null;
		if (isPrivate) {
			accessCode = crypto.randomBytes(3).toString("hex").toUpperCase();
		}

		const roomData = {
			name: name.trim(),
			description: description ? description.trim() : "",
			creator: req.user._id,
			duration: duration || 24,
			expiresAt,
			isPrivate: !!isPrivate,
			accessCode,
			participants: [req.user._id],
			tags: tags || [],
		};

		const newRoom = await Room.create(roomData);

		const roomResponse = newRoom.toObject();
		delete roomResponse.accessCode;

		return sendSuccess(res, 201, "Room created successfully", {
			data: {
				room: roomResponse,
				accessCode: isPrivate ? accessCode : null,
			},
		});
	} catch (error) {
		return sendError(res, 500, "Error creating room", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getRooms = async (req, res) => {
	try {
		const { page = 1, limit = 10, filter } = req.query;
		const skip = (page - 1) * limit;

		let query = { expiresAt: { $gt: new Date() } };

		if (filter === "joined") {
			query.participants = req.user._id;
		} else if (filter === "created") {
			query.creator = req.user._id;
		}
		if (!filter || filter !== "joined") {
			query.$or = [
				{ isPrivate: false },
				{ isPrivate: true, participants: req.user._id },
			];
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
		if (room.isPrivate && !room.participants.includes(req.user._id)) {
			return sendError(
				res,
				403,
				"This is a private room. Please provide an access code to join"
			);
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

exports.joinRoom = async (req, res) => {
	try {
		const { roomId } = req.params;
		const { accessCode } = req.body;

		const room = await Room.findById(roomId).select("+accessCode");

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		if (room.isExpired) {
			return sendError(res, 410, "This room has expired");
		}

		if (room.participants.includes(req.user._id)) {
			return sendSuccess(res, 200, "You are already a member of this room", {
				data: { room },
			});
		}
		if (room.isPrivate) {
			if (!accessCode) {
				return sendError(res, 400, "Access code is required for private rooms");
			}

			if (room.accessCode !== accessCode) {
				return sendError(res, 403, "Invalid access code");
			}
		}

		room.participants.push(req.user._id);
		await room.save();

		const anonymousId = crypto
			.createHash("sha256")
			.update(`${req.user._id}-${roomId}-${Date.now()}`)
			.digest("hex")
			.substring(0, 10);

		const anonymousName = `Anonymous-${Math.floor(
			1000 + Math.random() * 9000
		)}`;

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

exports.leaveRoom = async (req, res) => {
	try {
		const { roomId } = req.params;

		const room = await Room.findById(roomId);

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

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

exports.sendMessage = async (req, res) => {
	try {
		const { roomId } = req.params;
		const { content, anonymousId, anonymousName } = req.body;

		if (!content || content.trim() === "") {
			return sendError(res, 400, "Message content is required");
		}

		const room = await Room.findById(roomId);

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		if (room.isExpired) {
			return sendError(res, 410, "This room has expired");
		}

		if (!room.participants.includes(req.user._id)) {
			return sendError(
				res,
				403,
				"You must join the room before sending messages"
			);
		}

		const newMessage = await Message.create({
			room: roomId,
			content: content.trim(),
			sender: req.user._id,
			anonymousId,
			anonymousName,
		});

		const messageResponse = newMessage.toObject();
		delete messageResponse.sender;

		return sendSuccess(res, 201, "Message sent successfully", {
			data: { message: messageResponse },
		});
	} catch (error) {
		return sendError(res, 500, "Error sending message", {
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

exports.getMessages = async (req, res) => {
	try {
		const { roomId } = req.params;
		const { page = 1, limit = 50 } = req.query;
		const skip = (page - 1) * limit;

		const room = await Room.findById(roomId);

		if (!room) {
			return sendError(res, 404, "Room not found");
		}

		if (room.isExpired) {
			return sendError(res, 410, "This room has expired");
		}

		if (!room.participants.includes(req.user._id)) {
			return sendError(res, 403, "You must join the room to view messages");
		}

		const totalMessages = await Message.countDocuments({ room: roomId });
		const messages = await Message.find({ room: roomId })
			.sort({ createdAt: 1 })
			.skip(skip)
			.limit(parseInt(limit));

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
