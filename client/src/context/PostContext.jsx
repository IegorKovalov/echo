import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import PostService from "../services/post.service";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const PostContext = createContext();

export const usePost = () => {
	const context = useContext(PostContext);
	if (!context) {
		throw new Error("usePost must be used within a PostProvider");
	}
	return context;
};

export const PostProvider = ({ children }) => {
	const [posts, setPosts] = useState([]);
	const [trendingPosts, setTrendingPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [loadingTrending, setLoadingTrending] = useState(true);
	const [pagination, setPagination] = useState({
		total: 0,
		totalPages: 0,
		currentPage: 1,
		postsPerPage: 15,
		hasNextPage: false,
		hasPrevPage: false,
	});

	const { user } = useAuth();
	const { showSuccess, showError } = useToast();

	const fetchPosts = useCallback(
		async (page = 1, limit = 15, includeExpired = false) => {
			if (!user) return [];

			try {
				setLoadingPosts(true);
				const response = await PostService.getAllPosts(
					page,
					limit,
					includeExpired
				);
				const fetchedPosts = response.data.posts || [];
				if (response.pagination) {
					setPagination({
						total: response.pagination.total || 0,
						totalPages: response.pagination.totalPages || 0,
						currentPage: response.pagination.currentPage || 1,
						postsPerPage: response.pagination.postsPerPage || 15,
						hasNextPage: response.pagination.hasNextPage || false,
						hasPrevPage: response.pagination.hasPrevPage || false,
					});
				}

				// Append posts if loading more, replace if refreshing from page 1
				if (page > 1) {
					setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
				} else {
					setPosts(fetchedPosts);
				}

				return fetchedPosts;
			} catch (error) {
				console.error("Error fetching posts:", error);
				showError("Failed to fetch posts.");
				return [];
			} finally {
				setLoadingPosts(false);
			}
		},
		[user, setPosts, showError]
	);

	const fetchUserPosts = useCallback(
		async (userId, includeExpired = false, page = 1, limit = 15) => {
			if (!user) return [];

			try {
				setLoadingPosts(true);
				const response = await PostService.getUserPosts(
					userId,
					includeExpired,
					page,
					limit
				);
				let userPosts = [];

				if (response && response.data) {
					if (Array.isArray(response.data.posts)) {
						userPosts = response.data.posts;
					} else if (Array.isArray(response.data)) {
						userPosts = response.data;
					}

					// Update pagination information if available
					if (response.pagination) {
						setPagination({
							total: response.pagination.total || 0,
							totalPages: response.pagination.totalPages || 0,
							currentPage: response.pagination.currentPage || 1,
							postsPerPage: response.pagination.postsPerPage || 15,
							hasNextPage: response.pagination.hasNextPage || false,
							hasPrevPage: response.pagination.hasPrevPage || false,
						});
					}
				}

				return userPosts;
			} catch (error) {
				console.error("Error fetching user posts:", error);
				showError("Failed to fetch user posts.");
				return [];
			} finally {
				setLoadingPosts(false);
			}
		},
		[user, setLoadingPosts, showError]
	);

	const loadMorePosts = useCallback(async () => {
		if (!pagination.hasNextPage || loadingPosts) return;

		const nextPage = pagination.currentPage + 1;
		return await fetchPosts(nextPage, pagination.postsPerPage);
	}, [pagination, loadingPosts, fetchPosts]);

	const refreshPosts = useCallback(async () => {
		return await fetchPosts(1, pagination.postsPerPage);
	}, [fetchPosts, pagination.postsPerPage]);

	const fetchTrendingPosts = useCallback(async () => {
		if (!user) return [];

		try {
			setLoadingTrending(true);
			const response = await PostService.getTrendingPosts();
			const trendingData = response.data.posts || [];
			setTrendingPosts(trendingData);
			return trendingData;
		} catch (error) {
			console.error("Error fetching trending posts:", error);
			showError("Failed to fetch trending posts.");
			return [];
		} finally {
			setLoadingTrending(false);
		}
	}, [user, setLoadingTrending, setTrendingPosts, showError]);

	const createPost = useCallback(
		async (postData) => {
			try {
				const response = await PostService.createPost(postData);
				const newPost = response.data.post || response.data;
				setPosts((prevPosts) => [newPost, ...prevPosts]);
				showSuccess("Post created successfully!");
				return newPost;
			} catch (error) {
				console.error("Error creating post:", error);
				showError(error.message || "Failed to create post");
				throw error;
			}
		},
		[setPosts, showSuccess, showError]
	);

	const updatePost = useCallback(
		async (postId, postData) => {
			try {
				const response = await PostService.updatePost(postId, postData);
				const updatedPost = response.data.post || response.data;

				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post._id === postId ? { ...post, ...updatedPost } : post
					)
				);
				showSuccess("Post updated successfully!");
				return updatedPost;
			} catch (error) {
				console.error("Error updating post:", error);
				showError(error.message || "Failed to update post");
				throw error;
			}
		},
		[setPosts, showSuccess, showError]
	);

	const deletePost = useCallback(
		async (postId) => {
			try {
				await PostService.deletePost(postId);
				setPosts((prevPosts) =>
					prevPosts.filter((post) => post._id !== postId)
				);
				showSuccess("Post deleted successfully!");
				return true;
			} catch (error) {
				console.error("Error deleting post:", error);
				showError(error.message || "Failed to delete post");
				throw error;
			}
		},
		[setPosts, showSuccess, showError]
	);

	const renewPost = useCallback(
		async (postId, hours = 24) => {
			try {
				const response = await PostService.renewPost(postId, hours);
				const renewedPost = response.data.post || response.data;

				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post._id === postId ? { ...post, ...renewedPost } : post
					)
				);
				showSuccess(`Post renewed for ${hours} more hours!`);
				return renewedPost;
			} catch (error) {
				console.error("Error renewing post:", error);
				showError(error.message || "Failed to renew post");
				throw error;
			}
		},
		[setPosts, showSuccess, showError]
	);

	const addComment = useCallback(
		async (postId, commentContent) => {
			try {
				const response = await PostService.addComment(postId, commentContent);
				const updatedPost = response.data.post || response.data;

				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post._id === postId ? { ...post, ...updatedPost } : post
					)
				);
				return updatedPost;
			} catch (error) {
				console.error("Error adding comment:", error);
				showError(error.message || "Failed to add comment");
				throw error;
			}
		},
		[setPosts, showError]
	);

	const deleteComment = useCallback(
		async (postId, commentId) => {
			try {
				const response = await PostService.deleteComment(postId, commentId);
				let updatedPost;

				if (response && response.data && response.data.post) {
					updatedPost = response.data.post;
				} else if (response && response.data) {
					updatedPost = response.data;
				} else {
					const postToUpdate = posts.find((p) => p._id === postId);
					if (postToUpdate) {
						updatedPost = {
							...postToUpdate,
							comments: postToUpdate.comments.filter(
								(c) => c._id !== commentId
							),
						};
					} else {
						console.warn(`Post with ID ${postId} not found in state.`);
						return null;
					}
				}

				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post._id === postId ? { ...post, ...updatedPost } : post
					)
				);
				return updatedPost;
			} catch (error) {
				console.error("Error deleting comment:", error);
				showError(error.message || "Failed to delete comment");
				throw error;
			}
		},
		[posts, setPosts, showError]
	);

	const getHoursLeft = useCallback((expiresAt) => {
		if (!expiresAt) return 0;
		return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
	}, []);

	useEffect(() => {
		if (user) {
			fetchPosts(1, pagination.postsPerPage);
			fetchTrendingPosts();
		}
	}, [user, fetchPosts, fetchTrendingPosts, pagination.postsPerPage]);

	const contextValue = useMemo(
		() => ({
			posts,
			trendingPosts,
			loadingPosts,
			loadingTrending,
			pagination,
			fetchPosts,
			fetchUserPosts,
			fetchTrendingPosts,
			createPost,
			updatePost,
			deletePost,
			renewPost,
			addComment,
			deleteComment,
			getHoursLeft,
			loadMorePosts,
			refreshPosts,
		}),
		[
			posts,
			trendingPosts,
			loadingPosts,
			loadingTrending,
			pagination,
			fetchPosts,
			fetchUserPosts,
			fetchTrendingPosts,
			createPost,
			updatePost,
			deletePost,
			renewPost,
			addComment,
			deleteComment,
			getHoursLeft,
			loadMorePosts,
			refreshPosts,
		]
	);

	return (
		<PostContext.Provider value={contextValue}>{children}</PostContext.Provider>
	);
};
