import api from "./api";

const ROOMS_URL = "/rooms";

const RoomService = {
	discoverRooms: async (page = 1, limit = 20) => {
		try {
			const response = await api.get(`${ROOMS_URL}/discover`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error("Discover rooms error:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to discover rooms.";
			throw new Error(errorMessage);
		}
	},

	getOfficialRooms: async (page = 1, limit = 20) => {
		try {
			const response = await api.get(`${ROOMS_URL}/official`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error("Get official rooms error:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch official rooms.";
			throw new Error(errorMessage);
		}
	},

	// Gets rooms the current user is a member of
	getUserRooms: async (page = 1, limit = 20) => {
		try {
			// The backend route GET /api/v1/rooms is already set to roomController.getUserRooms
			const response = await api.get(ROOMS_URL, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error("Get user rooms error:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch your rooms.";
			throw new Error(errorMessage);
		}
	},

	getRoom: async (roomId) => {
		try {
			const response = await api.get(`${ROOMS_URL}/${roomId}`);
			return response.data;
		} catch (error) {
			console.error(`Get room error for ${roomId}:`, error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch room details.";
			throw new Error(errorMessage);
		}
	},

	getRoomMembers: async (roomId, page = 1, limit = 50) => {
		try {
			const response = await api.get(`${ROOMS_URL}/${roomId}/members`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error(`Get room members error for ${roomId}:`, error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch room members.";
			throw new Error(errorMessage);
		}
	},

	getRoomMessages: async (roomId, page = 1, limit = 50) => {
		try {
			const response = await api.get(`${ROOMS_URL}/${roomId}/messages`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error(`Get room messages error for ${roomId}:`, error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch room messages.";
			throw new Error(errorMessage);
		}
	},

	// --- Placeholder for Phase 2 ---
	createRoom: async (roomData) => {
		try {
			const response = await api.post(ROOMS_URL, roomData);
			return response.data;
		} catch (error) {
			console.error("Create room error:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to create room.";
			throw new Error(errorMessage);
		}
	},

	joinRoom: async (roomId) => {
		try {
			const response = await api.post(`${ROOMS_URL}/${roomId}/join`);
			return response.data;
		} catch (error) {
			console.error(`Join room error for ${roomId}:`, error);
			const errorMessage =
				error.response?.data?.message || "Failed to join room.";
			throw new Error(errorMessage);
		}
	},

	leaveRoom: async (roomId) => {
		try {
			const response = await api.post(`${ROOMS_URL}/${roomId}/leave`);
			return response.data; // Backend sends 204, so data might be minimal
		} catch (error) {
			console.error(`Leave room error for ${roomId}:`, error);
			const errorMessage =
				error.response?.data?.message || "Failed to leave room.";
			throw new Error(errorMessage);
		}
	},

	// --- Placeholder for Phase 3 ---
	createMessage: async (roomId, messageData) => {
		try {
			const response = await api.post(
				`${ROOMS_URL}/${roomId}/messages`,
				messageData
			);
			return response.data;
		} catch (error) {
			console.error(`Create message error for room ${roomId}:`, error);
			const errorMessage =
				error.response?.data?.message || "Failed to send message.";
			throw new Error(errorMessage);
		}
	},
	replyToMessage: async (roomId, messageId, replyData) => {
		try {
			// replyData should contain { content, format (optional) }
			const response = await api.post(
				`${ROOMS_URL}/${roomId}/messages/${messageId}/reply`,
				replyData
			);
			return response.data;
		} catch (error) {
			console.error(
				`Reply to message error for room ${roomId}, message ${messageId}:`,
				error
			);
			const errorMessage =
				error.response?.data?.message || "Failed to send reply.";
			throw new Error(errorMessage);
		}
	},

	reactToMessage: async (roomId, messageId, emojiData) => {
		// emojiData = { emoji }
		try {
			const response = await api.post(
				`${ROOMS_URL}/${roomId}/messages/${messageId}/react`,
				emojiData
			);
			return response.data;
		} catch (error) {
			console.error(
				`React to message error for room ${roomId}, message ${messageId}:`,
				error
			);
			const errorMessage =
				error.response?.data?.message || "Failed to react to message.";
			throw new Error(errorMessage);
		}
	},

	removeReaction: async (roomId, messageId, emojiData) => {
		// emojiData = { emoji }
		try {
			// Note: Backend uses DELETE for removeReaction, but service might still be POST if body is needed.
			// Assuming backend is DELETE /:roomId/messages/:messageId/react with emoji in body/params
			// For simplicity, if backend uses DELETE and expects emoji in body, axios.delete can take a data payload.
			// If emoji is in params, adjust URL. Let's assume body for now.
			const response = await api.delete(
				`${ROOMS_URL}/${roomId}/messages/${messageId}/react`,
				{ data: emojiData }
			);
			return response.data;
		} catch (error) {
			console.error(
				`Remove reaction error for room ${roomId}, message ${messageId}:`,
				error
			);
			const errorMessage =
				error.response?.data?.message || "Failed to remove reaction.";
			throw new Error(errorMessage);
		}
	},

	adminDeleteMessage: async (roomId, messageId) => {
		try {
			const response = await api.delete(
				`${ROOMS_URL}/${roomId}/messages/${messageId}/admin`
			);
			return response.data; // Expects 204 or success message
		} catch (error) {
			console.error(
				`Admin delete message error for room ${roomId}, message ${messageId}:`,
				error
			);
			const errorMessage =
				error.response?.data?.message || "Failed to admin-delete message.";
			throw new Error(errorMessage);
		}
	},
};

export default RoomService;
