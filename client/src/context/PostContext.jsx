// client/src/context/PostContext.jsx
import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { PostActionsProvider, usePostActions } from "./PostActionsContext";
import { PostDataProvider, usePostData } from "./PostDataContext";

// Create a combined hook for backward compatibility
export const usePost = () => {
	const dataContext = usePostData();
	const actionsContext = usePostActions();

	// Combine both contexts into one object for easier use
	return {
		// Data properties
		posts: dataContext.posts,
		trendingPosts: dataContext.trendingPosts,
		loadingPosts: dataContext.loadingPosts,
		loadingTrending: dataContext.loadingTrending,

		// Action methods
		...actionsContext,
	};
};

// Create a combined provider component
export const PostProvider = ({ children }) => {
	const { user } = useAuth();

	return (
		<PostDataProvider user={user}>
			<PostActionsProvider user={user}>
				<PostDataFetcher>{children}</PostDataFetcher>
			</PostActionsProvider>
		</PostDataProvider>
	);
};

// Helper component to fetch initial data
const PostDataFetcher = ({ children }) => {
	const { user } = useAuth();
	const { fetchPosts, fetchTrendingPosts } = usePostActions();

	// Fetch initial data when user is authenticated
	useEffect(() => {
		if (user) {
			fetchPosts();
			fetchTrendingPosts();
		}
	}, [user, fetchPosts, fetchTrendingPosts]);

	return <>{children}</>;
};
