import api from "./api";

const ROOMS_URL = "/rooms";

// Helper function for common header setup with auth token
const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

const RoomService = {
	// Get all rooms with optional filtering
	getRooms: async (filter = null, page = 1, limit = 10) => {
		try {
			const headers = getAuthHeaders();
			const params = { page, limit };
			
			if (filter) {
				params.filter = filter;
			}

			const response = await api.get(ROOMS_URL, { headers, params });
			return response.data;
		} catch (error) {
			console.error("Error fetching rooms:", error);
			throw error;
		}
	},

	// Get a specific room by ID
	getRoom: async (roomId) => {
		try {
			const headers = getAuthHeaders();
			const response = await api.get(`${ROOMS_URL}/${roomId}`, { headers });
			return response.data;
		} catch (error) {
			console.error("Error fetching room details:", error);
			throw error;
		}
	},

	// Create a new room
	createRoom: async (roomData) => {
		try {
			const headers = getAuthHeaders();
			const response = await api.post(ROOMS_URL, roomData, { headers });
			return response.data;
		} catch (error) {
			console.error("Error creating room:", error);
			throw error;
		}
	},

	// Join a room
	joinRoom: async (roomId) => {
		try {
			const headers = getAuthHeaders();
			const response = await api.post(
				`${ROOMS_URL}/${roomId}/join`, 
				{}, 
				{ headers }
			);
			return response.data;
		} catch (error) {
			console.error("Error joining room:", error);
			throw error;
		}
	},

	// Leave a room
	leaveRoom: async (roomId) => {
		try {
			const headers = getAuthHeaders();
			const response = await api.delete(
				`${ROOMS_URL}/${roomId}/leave`, 
				{ headers }
			);
			return response.data;
		} catch (error) {
			console.error("Error leaving room:", error);
			throw error;
		}
	},

	// Send a message in a room
	sendMessage: async (roomId, messageData) => {
		try {
			const headers = getAuthHeaders();
			const response = await api.post(
				`${ROOMS_URL}/${roomId}/messages`,
				messageData,
				{ headers }
			);
			return response.data;
		} catch (error) {
			console.error("Error sending message:", error);
			throw error;
		}
	},

	// Get messages for a room
	getMessages: async (roomId, page = 1, limit = 50) => {
		try {
			const headers = getAuthHeaders();
			const response = await api.get(
				`${ROOMS_URL}/${roomId}/messages`, 
				{ headers, params: { page, limit } }
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching messages:", error);
			throw error;
		}
	},
};

export default RoomService;
