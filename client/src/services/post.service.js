import api from "./api";

const POSTS_URL = "/posts";

const PostService = {
	getAllPosts: async (page = 1, limit = 15, includeExpired = false) => {
		try {
			const response = await api.get(POSTS_URL, {
				params: { page, limit, includeExpired },
			});
			return response.data;
		} catch (error) {
			console.error("Get all posts error:", error);
			const errorMessage = error.response?.data?.message || "Failed to fetch posts.";
			throw new Error(errorMessage);
		}
	},

	getUserPosts: async (
		userId,
		includeExpired = false,
		page = 1,
		limit = 15
	) => {
		try {
			const response = await api.get(`${POSTS_URL}/user/${userId}`, {
				params: { includeExpired, page, limit },
			});
			return response.data;
		} catch (error) {
			console.error(`Get user posts error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to fetch user's posts.";
			throw new Error(errorMessage);
		}
	},

	getPost: async (id) => {
		try {
			const response = await api.get(`${POSTS_URL}/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Get post error for ${id}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to fetch post details.";
			throw new Error(errorMessage);
		}
	},

	createPost: async (formData) => {
		try {
			const response = await api.post(POSTS_URL, formData, { headers: {"Content-Type": "multipart/form-data" } });
			return response.data;
		} catch (error) {
			console.error("Create post error:", error);
			const errorMessage = error.response?.data?.message || "Failed to create post.";
			throw new Error(errorMessage);
		}
	},

	updatePost: async (id, formData) => {
		try {
			const response = await api.patch(`${POSTS_URL}/${id}`, formData, {
			});
			return response.data;
		} catch (error) {
			console.error(`Update post error for ${id}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to update post.";
			throw new Error(errorMessage);
		}
	},

	deletePost: async (id) => {
		try {
			const response = await api.delete(`${POSTS_URL}/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Delete post error for ${id}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to delete post.";
			throw new Error(errorMessage);
		}
	},

	addComment: async (id, commentContent) => {
		try {
			const response = await api.post(
				`${POSTS_URL}/${id}/comments`,
				{ commentContent }
			);
			return response.data;
		} catch (error) {
			console.error(`Add comment error for post ${id}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to add comment.";
			throw new Error(errorMessage);
		}
	},

	deleteComment: async (postId, commentId) => {
		try {
			const response = await api.delete(
				`${POSTS_URL}/${postId}/comments/${commentId}`
			);
			return response.data;
		} catch (error) {
			console.error(`Delete comment error for post ${postId}, comment ${commentId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to delete comment.";
			throw new Error(errorMessage);
		}
	},

	addCommentReply: async (postId, commentId, replyContent, replyToUser) => {
		try {
			const response = await api.post(
				`${POSTS_URL}/${postId}/comments/${commentId}/replies`,
				{ replyContent, replyToUser }
			);
			return response.data;
		} catch (error) {
			console.error(`Add reply error for post ${postId}, comment ${commentId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to add reply.";
			throw new Error(errorMessage);
		}
	},

	deleteCommentReply: async (postId, commentId, replyId) => {
		try {
			const response = await api.delete(
				`${POSTS_URL}/${postId}/comments/${commentId}/replies/${replyId}`
			);
			return response.data;
		} catch (error) {
			console.error(`Delete reply error for post ${postId}, comment ${commentId}, reply ${replyId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to delete reply.";
			throw new Error(errorMessage);
		}
	},

	renewPost: async (id, hours = 24) => {
		try {
			const response = await api.post(
				`${POSTS_URL}/${id}/renew`,
				{ hours }
			);
			return response.data;
		} catch (error) {
			console.error(`Renew post error for ${id}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to renew post.";
			throw new Error(errorMessage);
		}
	},

	getTrendingPosts: async () => {
		try {
			const response = await api.get(`${POSTS_URL}/trending`);
			return response.data;
		} catch (error) {
			console.error("Get trending posts error:", error);
			const errorMessage = error.response?.data?.message || "Failed to fetch trending posts.";
			throw new Error(errorMessage);
		}
	},

	incrementViews: async (id) => {
		try {
			const response = await api.patch(
				`${POSTS_URL}/${id}/view`,
				{}
			);
			return response.data;
		} catch (error) {
			console.warn(`Increment view error for post ${id}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to increment view.";
			throw new Error(errorMessage);
		}
	},

	batchIncrementViews: async (postIds) => {
		try {
			const response = await api.post(
				`${POSTS_URL}/batch-view`,
				{ postIds }
			);
			return response.data;
		} catch (error) {
			console.warn("Batch increment views error:", error);
			const errorMessage = error.response?.data?.message || "Failed to batch increment views.";
			throw new Error(errorMessage);
		}
	},
};

export default PostService;
