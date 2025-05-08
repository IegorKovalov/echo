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

		if (process.env.NODE_ENV !== "production") {
			console.log("PostService - formData contents:");
			for (const pair of formData.entries()) {
				const [key, value] = pair;
				if (value instanceof File) {
					console.log(
						`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
					);
				} else {
					console.log(`${key}: ${value}`);
				}
			}
		}

		const response = await api.post(POSTS_URL, formData, {
			headers,
			transformRequest: [(data) => data],
		});
		return response.data;
	},

	updatePost: async (id, formData) => {
		const token = localStorage.getItem("token");

		// When sending FormData with files, we should only set the Authorization header
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		// Better logging for FormData
		if (process.env.NODE_ENV !== "production") {
			console.log(`PostService - updating post ${id}, formData contents:`);
			for (const pair of formData.entries()) {
				const [key, value] = pair;
				if (value instanceof File) {
					console.log(
						`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
					);
				} else {
					console.log(`${key}: ${value}`);
				}
			}
		}

		const response = await api.patch(`${POSTS_URL}/${id}`, formData, {
			headers,
			transformRequest: [(data) => data],
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
