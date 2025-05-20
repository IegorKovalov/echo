import api from "./api";

const FOLLOWERS_URL = "/followers";

const FollowerService = {
	followUser: async (userId) => {
		try {
			const response = await api.post(
				`${FOLLOWERS_URL}/${userId}`,
				{}
			);
			return response.data;
		} catch (error) {
			console.error(`Follow user error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to follow user.";
			throw new Error(errorMessage);
		}
	},
	unfollowUser: async (userId) => {
		try {
			const response = await api.delete(`${FOLLOWERS_URL}/${userId}`);
			return response.data;
		} catch (error) {
			console.error(`Unfollow user error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to unfollow user.";
			throw new Error(errorMessage);
		}
	},

	getFollowers: async (userId, page = 1, limit = 20) => {
		try {
			const response = await api.get(`${FOLLOWERS_URL}/${userId}`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error(`Get followers error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to fetch followers.";
			throw new Error(errorMessage);
		}
	},

	getFollowing: async (userId, page = 1, limit = 20) => {
		try {
			const response = await api.get(`${FOLLOWERS_URL}/${userId}/following`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error(`Get following error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to fetch following list.";
			throw new Error(errorMessage);
		}
	},

	getFollowerStats: async (userId) => {
		try {
			const response = await api.get(`${FOLLOWERS_URL}/${userId}/stats`);
			return response.data;
		} catch (error) {
			console.error(`Get follower stats error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to fetch follower statistics.";
			throw new Error(errorMessage);
		}
	},
	getFollowingFeed: async (page = 1, limit = 10) => {
		try {
			const response = await api.get(`${FOLLOWERS_URL}/feed`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			console.error("Get following feed error:", error);
			const errorMessage = error.response?.data?.message || "Failed to fetch following feed.";
			throw new Error(errorMessage);
		}
	},
};

export default FollowerService;
