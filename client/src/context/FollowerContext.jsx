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
				}
				return null;
			} catch (error) {
				console.error("Error fetching follower stats:", error);
				return null;
			} finally {
				setIsLoadingStats(false);
			}
		},
		[user]
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
					// Update stats in state
					setFollowerStats((prev) => {
						const stats = prev[userId] || {
							followers: 0,
							following: 0,
							isFollowing: false,
						};
						return {
							...prev,
							[userId]: {
								...stats,
								followers: stats.followers + 1,
								isFollowing: true,
							},
						};
					});

					// Also update stats for current user if available
					if (followerStats[user._id]) {
						setFollowerStats((prev) => {
							const stats = prev[user._id];
							return {
								...prev,
								[user._id]: {
									...stats,
									following: stats.following + 1,
								},
							};
						});
					}

					showSuccess("User followed successfully");
					return true;
				}
				return false;
			} catch (error) {
				console.error("Error following user:", error);
				showError(error.message || "Failed to follow user");
				return false;
			}
		},
		[user, followerStats, showSuccess, showError]
	);

	// Unfollow a user
	const unfollowUser = useCallback(
		async (userId) => {
			if (!user || !userId) return false;

			try {
				const response = await FollowerService.unfollowUser(userId);

				if (response.status === "success") {
					// Update stats in state
					setFollowerStats((prev) => {
						const stats = prev[userId] || {
							followers: 0,
							following: 0,
							isFollowing: false,
						};
						return {
							...prev,
							[userId]: {
								...stats,
								followers: Math.max(0, stats.followers - 1),
								isFollowing: false,
							},
						};
					});

					// Also update stats for current user if available
					if (followerStats[user._id]) {
						setFollowerStats((prev) => {
							const stats = prev[user._id];
							return {
								...prev,
								[user._id]: {
									...stats,
									following: Math.max(0, stats.following - 1),
								},
							};
						});
					}

					showSuccess("User unfollowed successfully");
					return true;
				}
				return false;
			} catch (error) {
				console.error("Error unfollowing user:", error);
				showError(error.message || "Failed to unfollow user");
				return false;
			}
		},
		[user, followerStats, showSuccess, showError]
	);

	// Toggle follow status
	const toggleFollow = useCallback(
		async (userId, currentlyFollowing) => {
			if (currentlyFollowing) {
				return await unfollowUser(userId);
			} else {
				return await followUser(userId);
			}
		},
		[followUser, unfollowUser]
	);

	// Fetch feed posts from followed users
	const fetchFeedPosts = useCallback(
		async (page = 1) => {
			if (!user) return [];

			try {
				setIsLoadingFeed(true);
				const response = await FollowerService.getFollowingFeed(page);

				if (response.status === "success") {
					const newPosts = response.data.posts;

					if (page === 1) {
						setFeedPosts(newPosts);
					} else {
						setFeedPosts((prevPosts) => [...prevPosts, ...newPosts]);
					}

					setHasMoreFeed(response.data.hasMore);
					setFeedPage(response.data.currentPage);

					return newPosts;
				}
				return [];
			} catch (error) {
				console.error("Error fetching feed posts:", error);
				return [];
			} finally {
				setIsLoadingFeed(false);
			}
		},
		[user]
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
