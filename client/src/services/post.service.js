import api from "./api";

const POSTS_URL = "/posts";

const PostService = {
	getAllPosts: async () => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(POSTS_URL, { headers });
		return response.data;
	},

	getPost: async (id) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${POSTS_URL}/${id}`, { headers });
		return response.data;
	},

	createPost: async (postData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(POSTS_URL, postData, { headers });
		return response.data;
	},

	updatePost: async (id, postData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(`${POSTS_URL}/${id}`, postData, {
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

	likePost: async (id) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(`${POSTS_URL}/${id}/like`, {}, { headers });
		return response;
	},

	unlikePost: async (id) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.delete(`${POSTS_URL}/${id}/like`, { headers });
		return response;
	},

	addComment: async (id, commentContent) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.post(
			`${POSTS_URL}/${id}/comments`,
			commentContent,
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
};

export default PostService;
