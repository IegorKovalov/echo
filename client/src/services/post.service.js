import api from "./api";

const POSTS_URL = "/posts";

const PostService = {
	getAllPosts: async () => {
		const response = await api.get(POSTS_URL);
		return response.data;
	},

	getPost: async (id) => {
		const response = await api.get(`${POSTS_URL}/${id}`);
		return response.data;
	},

	createPost: async (postData) => {
		const response = await api.post(POSTS_URL, postData);
		return response.data;
	},

	updatePost: async (id, postData) => {
		const response = await api.patch(`${POSTS_URL}/${id}`, postData);
		return response.data;
	},

	deletePost: async (id) => {
		const response = await api.delete(`${POSTS_URL}/${id}`);
		return response.data;
	},

	likePost: async (id) => {
		const response = await api.post(`${POSTS_URL}/${id}/like`);
		return response.data;
	},

	unlikePost: async (id) => {
		const response = await api.delete(`${POSTS_URL}/${id}/like`);
		return response.data;
	},

	addComment: async (id, comment) => {
		const response = await api.post(`${POSTS_URL}/${id}/comments`, comment);
		return response.data;
	},

	deleteComment: async (postId, commentId) => {
		const response = await api.delete(
			`${POSTS_URL}/${postId}/comments/${commentId}`
		);
		return response.data;
	},
};

export default PostService;
