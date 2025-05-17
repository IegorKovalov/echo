import api from "./api";

const ROOMS_URL = "/rooms";

const RoomService = {
	createRoom: async (roomData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(ROOMS_URL, roomData, { headers });
		return response.data;
	},

	getRooms: async (filter = null, page = 1, limit = 10) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const params = { page, limit };
		if (filter) {
			params.filter = filter;
		}

		const response = await api.get(ROOMS_URL, {
			headers,
			params,
		});
		return response.data;
	},

	getRoom: async (roomId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${ROOMS_URL}/${roomId}`, { headers });
		return response.data;
	},

	joinRoom: async (roomId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(`${ROOMS_URL}/${roomId}/join`, {}, {
			headers,
		});
		return response.data;
	},

	leaveRoom: async (roomId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.delete(`${ROOMS_URL}/${roomId}/leave`, {
			headers,
		});
		return response.data;
	},

	sendMessage: async (roomId, messageData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(
			`${ROOMS_URL}/${roomId}/messages`,
			messageData,
			{ headers }
		);
		return response.data;
	},

	getMessages: async (roomId, page = 1, limit = 50) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${ROOMS_URL}/${roomId}/messages`, {
			headers,
			params: { page, limit },
		});
		return response.data;
	},
};

export default RoomService;
