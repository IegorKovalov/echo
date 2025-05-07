import api from "./api";

const POSTS_URL = "/posts";

const PostService = {
	getAllPosts: async (page = 1, limit = 15, includeExpired = false) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(POSTS_URL, {
			headers,
			params: { page, limit, includeExpired },
		});
		return response.data;
	},

	getUserPosts: async (
		userId,
		includeExpired = false,
		page = 1,
		limit = 15
	) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${POSTS_URL}/user/${userId}`, {
			headers,
			params: { includeExpired, page, limit },
		});
		return response.data;
	},

	getPost: async (id) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${POSTS_URL}/${id}`, { headers });
		return response.data;
	},

	createPost: async (formData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(POSTS_URL, formData, { headers });
		return response.data;
	},

	updatePost: async (id, formData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(`${POSTS_URL}/${id}`, formData, {
			headers,
		});
		return response.data;
	},

	deletePost: async (id) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.delete(`${POSTS_URL}/${id}`, { headers });
		return response.data;
	},

	addComment: async (id, commentContent) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(
			`${POSTS_URL}/${id}/comments`,
			{ commentContent },
			{
				headers,
			}
		);
		return response.data;
	},

	deleteComment: async (postId, commentId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.delete(
			`${POSTS_URL}/${postId}/comments/${commentId}`,
			{ headers }
		);
		return response.data;
	},

	renewPost: async (id, hours = 24) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(
			`${POSTS_URL}/${id}/renew`,
			{ hours },
			{ headers }
		);
		return response.data;
	},

	getTrendingPosts: async () => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${POSTS_URL}/trending`, { headers });
		return response.data;
	},

	incrementViews: async (id) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(
			`${POSTS_URL}/${id}/view`,
			{},
			{ headers }
		);
		return response.data;
	},

	batchIncrementViews: async (postIds) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(
			`${POSTS_URL}/batch-view`,
			{ postIds },
			{ headers }
		);
		return response.data;
	},
};

export default PostService;
