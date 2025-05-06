// client/src/context/PostActionsContext.jsx
import { createContext, useCallback, useContext, useMemo } from "react";
import PostService from "../services/post.service";
import { usePostData } from "./PostDataContext";
import { useToast } from "./ToastContext";

// Create context for post actions
const PostActionsContext = createContext();

export const usePostActions = () => {
	const context = useContext(PostActionsContext);
	if (!context) {
		throw new Error("usePostActions must be used within a PostActionsProvider");
	}
	return context;
};

export const PostActionsProvider = ({ children, user }) => {
	const {
		posts,
		setPosts,
		setTrendingPosts,
		setLoadingPosts,
		setLoadingTrending,
	} = usePostData();
	const { showSuccess, showError } = useToast();

	// Fetch all posts with proper dependencies
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
		[user, setLoadingPosts, setPosts]
	);

	// Fetch user posts with proper dependencies
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
		[user, setLoadingPosts]
	);

	// Fetch trending posts with proper dependencies
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
	}, [user, setLoadingTrending, setTrendingPosts]);

	// Create post with proper dependencies
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

	// Update post with proper dependencies
	const updatePost = useCallback(
		async (postId, postData) => {
			try {
				const response = await PostService.updatePost(postId, postData);
				// Standardize response handling
				const updatedPost = response.data.post || response.data;

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
		[setPosts, showSuccess, showError]
	);

	// Delete post with proper dependencies
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
		[setPosts, showSuccess, showError]
	);

	// Renew post with proper dependencies
	const renewPost = useCallback(
		async (postId, hours = 24) => {
			try {
				const response = await PostService.renewPost(postId, hours);
				// Standardize response handling
				const renewedPost = response.data.post || response.data;

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
		[setPosts, showSuccess, showError]
	);

	// Add comment with proper dependencies
	const addComment = useCallback(
		async (postId, commentContent) => {
			try {
				const response = await PostService.addComment(postId, commentContent);
				// Standardize response handling
				const updatedPost = response.data.post || response.data;

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
		[setPosts, showError]
	);

	// Delete comment with proper dependencies
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
					// If response doesn't include updated post, update locally
					updatedPost = {
						comments:
							posts
								.find((p) => p._id === postId)
								?.comments?.filter((c) => c._id !== commentId) || [],
					};
				}

				// Update the post in the context state
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

	// Calculate hours left until post expiration
	const getHoursLeft = useCallback((expiresAt) => {
		if (!expiresAt) return 0;
		return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
	}, []);

	// Memoize the context value
	const value = useMemo(
		() => ({
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
		}),
		[
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
		]
	);

	return (
		<PostActionsContext.Provider value={value}>
			{children}
		</PostActionsContext.Provider>
	);
};
