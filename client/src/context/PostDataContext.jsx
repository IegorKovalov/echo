// client/src/context/PostDataContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Create context for post data
const PostDataContext = createContext();

export const usePostData = () => {
	const context = useContext(PostDataContext);
	if (!context) {
		throw new Error("usePostData must be used within a PostDataProvider");
	}
	return context;
};

export const PostDataProvider = ({ children, user }) => {
	const [posts, setPosts] = useState([]);
	const [trendingPosts, setTrendingPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [loadingTrending, setLoadingTrending] = useState(true);

	// Memoize value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
			posts,
			setPosts,
			trendingPosts,
			setTrendingPosts,
			loadingPosts,
			setLoadingPosts,
			loadingTrending,
			setLoadingTrending,
		}),
		[posts, trendingPosts, loadingPosts, loadingTrending]
	);

	return (
		<PostDataContext.Provider value={value}>
			{children}
		</PostDataContext.Provider>
	);
};
