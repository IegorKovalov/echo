import api from "./api";

const FOLLOWERS_URL = "/followers";

const FollowerService = {
	followUser: async (userId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(
			`${FOLLOWERS_URL}/${userId}`,
			{},
			{ headers }
		);
		return response.data;
	},
	unfollowUser: async (userId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.delete(`${FOLLOWERS_URL}/${userId}`, {
			headers,
		});
		return response.data;
	},

	getFollowers: async (userId, page = 1, limit = 20) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${FOLLOWERS_URL}/${userId}`, {
			headers,
			params: { page, limit },
		});
		return response.data;
	},

	getFollowing: async (userId, page = 1, limit = 20) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${FOLLOWERS_URL}/${userId}/following`, {
			headers,
			params: { page, limit },
		});
		return response.data;
	},

	getFollowerStats: async (userId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${FOLLOWERS_URL}/${userId}/stats`, {
			headers,
		});
		return response.data;
	},
	getFollowingFeed: async (page = 1, limit = 10) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${FOLLOWERS_URL}/feed`, {
			headers,
			params: { page, limit },
		});
		return response.data;
	},
};

export default FollowerService;
