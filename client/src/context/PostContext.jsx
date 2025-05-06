import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import PostService from "../services/post.service";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

// Create the context
const PostContext = createContext();

// Custom hook to use post context
export const usePost = () => {
	const context = useContext(PostContext);
	if (!context) {
		throw new Error("usePost must be used within a PostProvider");
	}
	return context;
};

// Post provider component
export const PostProvider = ({ children }) => {
	const { user } = useAuth();
	const { showSuccess, showError } = useToast();

	// Posts state
	const [posts, setPosts] = useState([]);
	const [trendingPosts, setTrendingPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [loadingTrending, setLoadingTrending] = useState(true);

	// Fetch all posts - using useCallback to prevent dependency cycles
	const fetchPosts = useCallback(
		async (includeExpired = false) => {
			if (!user) return [];

			try {
				setLoadingPosts(true);
				const response = await PostService.getAllPosts(includeExpired);
				const fetchedPosts = response.data.posts || [];
				setPosts(fetchedPosts);
				return fetchedPosts;
			} catch (error) {
				console.error("Error fetching posts:", error);
				return [];
			} finally {
				setLoadingPosts(false);
			}
		},
		[user]
	);
	const fetchUserPosts = useCallback(
		async (userId, includeExpired = false) => {
			if (!user) return [];

			try {
				setLoadingPosts(true);
				const response = await PostService.getUserPosts(userId, includeExpired);
				let userPosts = [];
				if (response && response.data) {
					if (Array.isArray(response.data.posts)) {
						userPosts = response.data.posts;
					} else if (Array.isArray(response.data)) {
						userPosts = response.data;
					}
				}

				return userPosts;
			} catch (error) {
				console.error("Error fetching user posts:", error);
				return [];
			} finally {
				setLoadingPosts(false);
			}
		},
		[user]
	);

	// Fetch trending posts - using useCallback to prevent dependency cycles
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
			return [];
		} finally {
			setLoadingTrending(false);
		}
	}, [user]);

	const createPost = useCallback(
		async (postData) => {
			try {
				const response = await PostService.createPost(postData);
				let newPost;
				if (response.data && response.data.post) {
					newPost = response.data.post;
				} else {
					newPost = response.data;
				}
				setPosts((prevPosts) => [newPost, ...prevPosts]);

				showSuccess("Post created successfully!");
				return newPost;
			} catch (error) {
				console.error("Error creating post:", error);
				showError(error.message || "Failed to create post");
				throw error;
			}
		},
		[showSuccess, showError]
	);

	const updatePost = useCallback(
		async (postId, postData) => {
			try {
				const response = await PostService.updatePost(postId, postData);
				let updatedPost;
				if (response.data && response.data.post) {
					updatedPost = response.data.post;
				} else {
					updatedPost = response.data;
				}

				// Update the post in the local state
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
		[showSuccess, showError]
	);

	// Delete a post - using useCallback
	const deletePost = useCallback(
		async (postId) => {
			try {
				await PostService.deletePost(postId);
				// Remove the post from local state
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
		[showSuccess, showError]
	);

	// Renew a post's expiration time - using useCallback
	const renewPost = useCallback(
		async (postId, hours = 24) => {
			try {
				const response = await PostService.renewPost(postId, hours);
				// Get the renewed post data
				let renewedPost;
				if (response.data && response.data.post) {
					renewedPost = response.data.post;
				} else {
					renewedPost = response.data;
				}

				// Update the post in the local state
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
		[showSuccess, showError]
	);

	// Add a comment to a post - using useCallback
	const addComment = useCallback(
		async (postId, commentContent) => {
			try {
				const response = await PostService.addComment(postId, commentContent);

				// Get the updated post with new comment
				let updatedPost;
				if (response.data && response.data.post) {
					updatedPost = response.data.post;
				} else {
					updatedPost = response.data;
				}

				// Update the post in the local state
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
		[showError]
	);

	// Delete a comment from a post - using useCallback
	const deleteComment = useCallback(
		async (postId, commentId) => {
			try {
				const response = await PostService.deleteComment(postId, commentId);

				// Get the updated post after comment deletion
				let updatedPost;
				if (response.data && response.data.post) {
					updatedPost = response.data.post;
				} else {
					updatedPost = response.data;
				}

				// Update the post in the local state
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
		[showError]
	);

	// Fetch initial data when the user is authenticated
	useEffect(() => {
		if (user) {
			fetchPosts();
			fetchTrendingPosts();
		}
	}, [user, fetchPosts, fetchTrendingPosts]);

	// Calculate hours left until post expiration
	const getHoursLeft = useCallback((expiresAt) => {
		if (!expiresAt) return 0;
		return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
	}, []);

	const contextValue = {
		posts,
		trendingPosts,
		loadingPosts,
		loadingTrending,
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
	};

	return (
		<PostContext.Provider value={contextValue}>{children}</PostContext.Provider>
	);
};
