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
	const [profilePosts, setProfilePosts] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [trendingPosts, setTrendingPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [loadingTrending, setLoadingTrending] = useState(true);
	const [initialLoad, setInitialLoad] = useState(true);

	const { user } = useAuth();
	const { showSuccess, showError } = useToast();

	const extractPostsFromResponse = (response) => {
		if (!response) {
			console.warn("Response is null or undefined");
			return [];
		}
		if (response.status === "success" && response.data) {
			if (response.data.posts && Array.isArray(response.data.posts)) {
				return response.data.posts;
			} else if (response.data.post) {
				return [response.data.post];
			} else {
				console.warn(
					"No posts or post field found in response.data",
					response.data
				);
			}
		} else {
			console.warn("Non-standard response format detected:", response);

			if (Array.isArray(response.posts)) {
				return response.posts;
			} else if (Array.isArray(response)) {
				return response;
			} else if (response.data && Array.isArray(response.data)) {
				return response.data;
			}
		}

		console.error("Could not extract posts from response:", response);
		return [];
	};

	const extractPaginationFromResponse = (response) => {
		if (!response) return { hasMore: false, currentPage: 1 };

		if (
			response.status === "success" &&
			response.data &&
			response.data.pagination
		) {
			return {
				hasMore: response.data.pagination.hasMore || false,
				currentPage: response.data.pagination.currentPage || 1,
			};
		}

		return { hasMore: false, currentPage: 1 };
	};

	const fetchPosts = useCallback(
		async (pageNum = 1, limit = 15, includeExpired = false) => {
			try {
				setLoadingPosts(true);
				const response = await PostService.getAllPosts(
					pageNum,
					limit,
					includeExpired
				);
				if (response) {
					const newPosts = extractPostsFromResponse(response);
					const pagination = extractPaginationFromResponse(response);

					setPosts((prevPosts) => {
						if (pageNum === 1) return newPosts;
						const existingIds = new Set(prevPosts.map((post) => post._id));
						const uniqueNewPosts = newPosts.filter(
							(post) => !existingIds.has(post._id)
						);
						return [...prevPosts, ...uniqueNewPosts];
					});
					setHasMore(pagination.hasMore);
					setPage(pagination.currentPage);

					if (initialLoad) {
						setInitialLoad(false);
					}
				}
			} catch (error) {
				console.error("Error fetching posts:", error);
				showError("Failed to fetch posts.");
			} finally {
				setLoadingPosts(false);
			}
		},
		[initialLoad, showError]
	);

	const fetchUserPosts = useCallback(
		async (userId, includeExpired = false, pageNum = 1, limit = 15) => {
			if (!user) return [];
			try {
				setLoadingPosts(true);
				const response = await PostService.getUserPosts(
					userId,
					includeExpired,
					pageNum,
					limit
				);
				const userPosts = extractPostsFromResponse(response);
				const pagination = extractPaginationFromResponse(response);
				if (pageNum === 1) {
					setProfilePosts(userPosts);
				} else {
					setProfilePosts((prevPosts) => {
						const existingIds = new Set(prevPosts.map((post) => post._id));
						const uniqueNewPosts = userPosts.filter(
							(post) => !existingIds.has(post._id)
						);
						return [...prevPosts, ...uniqueNewPosts];
					});
				}
				setHasMore(pagination.hasMore);
				setPage(pagination.currentPage);

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
		if (!hasMore || loadingPosts) return;

		const nextPage = page + 1;
		return await fetchPosts(nextPage, 15);
	}, [page, hasMore, loadingPosts, fetchPosts]);

	const refreshPosts = useCallback(async () => {
		return await fetchPosts(1, 15);
	}, [fetchPosts]);

	const fetchTrendingPosts = useCallback(async () => {
		if (!user) return [];

		try {
			setLoadingTrending(true);
			const response = await PostService.getTrendingPosts();
			let trendingData = [];
			if (response.status === "success" && response.data) {
				trendingData = response.data.posts || [];
			}

			setTrendingPosts(trendingData);
			return trendingData;
		} catch (error) {
			console.error("Error fetching trending posts:", error);
			showError("Failed to fetch trending posts.");
			return [];
		} finally {
			setLoadingTrending(false);
		}
	}, [user, setLoadingTrending, showError]);

	const createPost = useCallback(
		async (postData) => {
			try {
				const response = await PostService.createPost(postData);
				let newPost = {};
				if (response.status === "success" && response.data) {
					newPost = response.data.post;
				}

				if (newPost) {
					setPosts((prevPosts) => [newPost, ...prevPosts]);
					setProfilePosts((prevProfilePosts) => {
						if (prevProfilePosts.length > 0) {
							const firstPost = prevProfilePosts[0];
							if (
								firstPost &&
								firstPost.user &&
								newPost.user &&
								firstPost.user._id === newPost.user._id
							) {
								return [newPost, ...prevProfilePosts];
							}
						}
						return prevProfilePosts;
					});

					showSuccess("Post created successfully!");
					return newPost;
				} else {
					throw new Error("Invalid response format");
				}
			} catch (error) {
				console.error("Error creating post:", error);
				showError(error.message || "Failed to create post");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showSuccess, showError]
	);

	const updatePost = useCallback(
		async (postId, postData) => {
			try {
				const response = await PostService.updatePost(postId, postData);
				console.log("Update Post Response:", response);
				let updatedPost = {};
				if (response.status === "success" && response.data) {
					updatedPost = response.data.post;
				}
				if (updatedPost) {
					setPosts((prevPosts) =>
						prevPosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					setProfilePosts((prevProfilePosts) =>
						prevProfilePosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					showSuccess("Post updated successfully!");
					return updatedPost;
				} else {
					throw new Error("Invalid response format");
				}
			} catch (error) {
				console.error("Error updating post:", error);
				showError(error.message || "Failed to update post");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showSuccess, showError]
	);

	const deletePost = useCallback(
		async (postId) => {
			try {
				const response = await PostService.deletePost(postId);

				if (response.status === "success") {
					setPosts((prevPosts) =>
						prevPosts.filter((post) => post._id !== postId)
					);
					setProfilePosts((prevProfilePosts) =>
						prevProfilePosts.filter((post) => post._id !== postId)
					);

					showSuccess("Post deleted successfully!");
					return true;
				} else {
					throw new Error("Failed to delete post");
				}
			} catch (error) {
				console.error("Error deleting post:", error);
				showError(error.message || "Failed to delete post");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showSuccess, showError]
	);

	const renewPost = useCallback(
		async (postId, hours = 24) => {
			try {
				const response = await PostService.renewPost(postId, hours);
				let renewedPost = {};
				if (response.status === "success" && response.data) {
					renewedPost = response.data.post;
				}

				if (renewedPost) {
					setPosts((prevPosts) =>
						prevPosts.map((post) =>
							post._id === postId ? { ...post, ...renewedPost } : post
						)
					);
					setProfilePosts((prevProfilePosts) =>
						prevProfilePosts.map((post) =>
							post._id === postId ? { ...post, ...renewedPost } : post
						)
					);
					showSuccess(`Post renewed for ${hours} more hours!`);
					return renewedPost;
				} else {
					throw new Error("Invalid response format");
				}
			} catch (error) {
				console.error("Error renewing post:", error);
				showError(error.message || "Failed to renew post");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showSuccess, showError]
	);

	const addComment = useCallback(
		async (postId, commentContent) => {
			try {
				const response = await PostService.addComment(postId, commentContent);
				let updatedPost = {};
				if (response.status === "success" && response.data) {
					updatedPost = response.data.post;
				}
				if (updatedPost) {
					setPosts((prevPosts) =>
						prevPosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					setProfilePosts((prevProfilePosts) =>
						prevProfilePosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					return updatedPost;
				} else {
					throw new Error("Invalid response format");
				}
			} catch (error) {
				console.error("Error adding comment:", error);
				showError(error.message || "Failed to add comment");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showError]
	);

	const deleteComment = useCallback(
		async (postId, commentId) => {
			try {
				const response = await PostService.deleteComment(postId, commentId);
				if (response.status === "success") {
					const postToUpdate = posts.find((p) => p._id === postId);
					if (postToUpdate) {
						const updatedPost = {
							...postToUpdate,
							comments: postToUpdate.comments.filter(
								(c) => c._id !== commentId
							),
						};

						// Update in main posts array
						setPosts((prevPosts) =>
							prevPosts.map((post) =>
								post._id === postId ? updatedPost : post
							)
						);
						setProfilePosts((prevProfilePosts) =>
							prevProfilePosts.map((post) =>
								post._id === postId ? updatedPost : post
							)
						);

						return updatedPost;
					}
				}
				return null;
			} catch (error) {
				console.error("Error deleting comment:", error);
				showError(error.message || "Failed to delete comment");
				throw error;
			}
		},
		[posts, setPosts, setProfilePosts, showError]
	);

	const addCommentReply = useCallback(
		async (postId, commentId, replyContent, replyToUser) => {
			try {
				const response = await PostService.addCommentReply(
					postId,
					commentId,
					replyContent,
					replyToUser
				);
				let updatedPost = {};
				if (response.status === "success" && response.data) {
					updatedPost = response.data.post;
				}
				if (updatedPost) {
					setPosts((prevPosts) =>
						prevPosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					setProfilePosts((prevProfilePosts) =>
						prevProfilePosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					return updatedPost;
				} else {
					throw new Error("Invalid response format");
				}
			} catch (error) {
				console.error("Error adding comment reply:", error);
				showError(error.message || "Failed to add reply");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showError]
	);

	const deleteCommentReply = useCallback(
		async (postId, commentId, replyId) => {
			try {
				const response = await PostService.deleteCommentReply(
					postId,
					commentId,
					replyId
				);
				if (response.status === "success") {
					const updatedPost = response.data.post;
					setPosts((prevPosts) =>
						prevPosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					setProfilePosts((prevPosts) =>
						prevPosts.map((post) =>
							post._id === postId ? { ...post, ...updatedPost } : post
						)
					);
					showSuccess("Reply deleted successfully");
					return updatedPost;
				}
			} catch (error) {
				console.error("Error deleting reply:", error);
				showError(error.message || "Failed to delete reply");
				throw error;
			}
		},
		[setPosts, setProfilePosts, showSuccess, showError]
	);

	const getHoursLeft = useCallback((expiresAt) => {
		if (!expiresAt) return 0;
		return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
	}, []);

	useEffect(() => {
		if (user) {
			fetchPosts(1, 15);
			fetchTrendingPosts();
		}
	}, [user, fetchPosts, fetchTrendingPosts]);

	const contextValue = useMemo(
		() => ({
			posts,
			profilePosts,
			trendingPosts,
			loadingPosts,
			loadingTrending,
			page,
			hasMore,
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
			addCommentReply,
			deleteCommentReply,
		}),
		[
			posts,
			profilePosts,
			trendingPosts,
			loadingPosts,
			loadingTrending,
			page,
			hasMore,
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
			addCommentReply,
			deleteCommentReply,
		]
	);

	return (
		<PostContext.Provider value={contextValue}>{children}</PostContext.Provider>
	);
};
