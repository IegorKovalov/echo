import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import FollowerService from "../services/follower.service";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const FollowerContext = createContext();

export const useFollower = () => {
	const context = useContext(FollowerContext);
	if (!context) {
		throw new Error("useFollower must be used within a FollowerProvider");
	}
	return context;
};

export const FollowerProvider = ({ children }) => {
	const { user } = useAuth();
	const { showSuccess, showError } = useToast();

	const [followerStats, setFollowerStats] = useState({});
	const [isLoadingStats, setIsLoadingStats] = useState(false);
	const [feedPosts, setFeedPosts] = useState([]);
	const [isLoadingFeed, setIsLoadingFeed] = useState(false);
	const [hasMoreFeed, setHasMoreFeed] = useState(true);
	const [feedPage, setFeedPage] = useState(1);

	// Fetch follower stats for a user
	const fetchFollowerStats = useCallback(
		async (userId) => {
			if (!user || !userId) return null;

			try {
				setIsLoadingStats(true);
				const response = await FollowerService.getFollowerStats(userId);

				if (response.status === "success") {
					setFollowerStats((prev) => ({
						...prev,
						[userId]: response.data.stats,
					}));
					return response.data.stats;
				} else {
					const message = response.message || "Could not retrieve follower stats.";
					showError(message);
					return null;
				}
			} catch (error) {
				console.error("Error fetching follower stats:", error);
				showError(error.message || "Failed to load follower stats");
				return null;
			} finally {
				setIsLoadingStats(false);
			}
		},
		[user, showError]
	);

	// Get follower stats for a user from state or fetch if not available
	const getFollowerStats = useCallback(
		async (userId) => {
			if (followerStats[userId]) {
				return followerStats[userId];
			}

			return await fetchFollowerStats(userId);
		},
		[followerStats, fetchFollowerStats]
	);

	// Follow a user
	const followUser = useCallback(
		async (userId) => {
			if (!user || !userId) return false;

			try {
				const response = await FollowerService.followUser(userId);

				if (response.status === "success") {
					// Update stats in state (optimistic update based on structure)
					setFollowerStats((prev) => {
						const currentTargetStats = prev[userId] || { followers: 0, isFollowing: false };
						const currentUserStats = prev[user._id] || { following: 0 };

						return {
							...prev,
							[userId]: {
								...currentTargetStats,
								followers: (currentTargetStats.followers || 0) + 1,
								isFollowing: true,
							},
							[user._id]: {
								...currentUserStats,
								following: (currentUserStats.following || 0) + 1,
							},
						};
					});

					showSuccess(response.message || "User followed successfully");
					return true;
				} else {
					const message = response.message || "Operation was not successful.";
					showError(message);
					return false;
				}
			} catch (error) {
				console.error("Error following user:", error);
				showError(error.message || "Failed to follow user");
				return false;
			}
		},
		[user, showSuccess, showError]
	);

	// Unfollow a user
	const unfollowUser = useCallback(
		async (userId) => {
			if (!user || !userId) return false;

			try {
				const response = await FollowerService.unfollowUser(userId);

				if (response.status === "success") {
					// Update stats in state (optimistic update)
					setFollowerStats((prev) => {
						const currentTargetStats = prev[userId] || { followers: 0, isFollowing: true };
						const currentUserStats = prev[user._id] || { following: 0 };

						return {
							...prev,
							[userId]: {
								...currentTargetStats,
								followers: Math.max(0, (currentTargetStats.followers || 0) - 1),
								isFollowing: false,
							},
							[user._id]: {
								...currentUserStats,
								following: Math.max(0, (currentUserStats.following || 0) - 1),
							},
						};
					});

					showSuccess(response.message || "User unfollowed successfully");
					return true;
				} else {
					const message = response.message || "Operation was not successful.";
					showError(message);
					return false;
				}
			} catch (error) {
				console.error("Error unfollowing user:", error);
				showError(error.message || "Failed to unfollow user");
				return false;
			}
		},
		[user, showSuccess, showError]
	);

	// Toggle follow status
	const toggleFollow = useCallback(
		async (userIdToToggle, currentFollowState) => {
			if (currentFollowState) {
				return await unfollowUser(userIdToToggle);
			} else {
				return await followUser(userIdToToggle);
			}
		},
		[followUser, unfollowUser]
	);

	// Fetch feed posts from followed users
	const fetchFeedPosts = useCallback(
		async (pageNum = 1) => {
			if (!user) return [];

			try {
				setIsLoadingFeed(true);
				const response = await FollowerService.getFollowingFeed(pageNum);

				if (response.status === "success") {
					const newPosts = response.data.posts || [];

					if (pageNum === 1) {
						setFeedPosts(newPosts);
					} else {
						setFeedPosts((prevPosts) => [...prevPosts, ...newPosts]);
					}

					setHasMoreFeed(response.data.pagination?.hasMore || false);
					setFeedPage(response.data.pagination?.currentPage || pageNum);

					return newPosts;
				} else {
					const message = response.message || "Could not retrieve feed posts.";
					showError(message);
					return [];
				}
			} catch (error) {
				console.error("Error fetching feed posts:", error);
				showError(error.message || "Failed to load your feed.");
				return [];
			} finally {
				setIsLoadingFeed(false);
			}
		},
		[user, showError]
	);

	// Load more feed posts
	const loadMoreFeedPosts = useCallback(async () => {
		if (!hasMoreFeed || isLoadingFeed) return;

		return await fetchFeedPosts(feedPage + 1);
	}, [hasMoreFeed, isLoadingFeed, feedPage, fetchFeedPosts]);

	// Reset feed
	const resetFeed = useCallback(() => {
		setFeedPosts([]);
		setFeedPage(1);
		setHasMoreFeed(true);
	}, []);

	useEffect(() => {
		if (user) {
			// fetchFollowerStats(user._id); // Example: Fetch stats for logged-in user
			// fetchFeedPosts(); // Example: Fetch initial feed
		}
	}, [user, fetchFollowerStats, fetchFeedPosts]); // Dependencies for example calls

	// Value to provide in context
	const value = useMemo(
		() => ({
			followerStats,
			isLoadingStats,
			feedPosts,
			isLoadingFeed,
			hasMoreFeed,
			fetchFollowerStats,
			getFollowerStats,
			followUser,
			unfollowUser,
			toggleFollow,
			fetchFeedPosts,
			loadMoreFeedPosts,
			resetFeed,
		}),
		[
			followerStats,
			isLoadingStats,
			feedPosts,
			isLoadingFeed,
			hasMoreFeed,
			fetchFollowerStats,
			getFollowerStats,
			followUser,
			unfollowUser,
			toggleFollow,
			fetchFeedPosts,
			loadMoreFeedPosts,
			resetFeed,
		]
	);

	return (
		<FollowerContext.Provider value={value}>
			{children}
		</FollowerContext.Provider>
	);
};

export default FollowerContext;
