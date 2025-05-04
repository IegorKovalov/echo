import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import PostService from "../services/post.service";

const ViewTrackingContext = createContext();

export const ViewTrackingProvider = ({ children }) => {
	const [pendingViews, setPendingViews] = useState(new Set());
	const [isProcessing, setIsProcessing] = useState(false);
	const [viewCounts, setViewCounts] = useState({});
	const initializedPosts = useRef(new Set());

	// Track a post view
	const trackView = useCallback((postId) => {
		if (!postId) return;

		// Add the post ID to the pending views set
		setPendingViews((prevViews) => {
			const newViews = new Set(prevViews);
			newViews.add(postId);
			return newViews;
		});
	}, []);

	// Get the view count for a specific post
	const getViewCount = useCallback(
		(postId) => {
			return viewCounts[postId] || 0;
		},
		[viewCounts]
	);

	// Process pending views in batch
	useEffect(() => {
		const processBatch = async () => {
			if (pendingViews.size === 0 || isProcessing) return;

			setIsProcessing(true);

			try {
				const postIds = Array.from(pendingViews);

				// Send batch request to track views
				const result = await PostService.batchIncrementViews(postIds);

				if (result.status === "success") {
					// Clear processed views
					setPendingViews(new Set());

					// For now, we'll just update the view counts by adding 1 to each
					// In a real implementation, you might want to fetch updated counts
					setViewCounts((prev) => {
						const updated = { ...prev };
						postIds.forEach((id) => {
							updated[id] = (updated[id] || 0) + 1;
						});
						return updated;
					});
				}
			} catch (error) {
				console.error("Error processing batch view tracking:", error);
			} finally {
				setIsProcessing(false);
			}
		};

		// Create a timer to process batches every few seconds
		const timer = setTimeout(processBatch, 3000);

		// Clean up the timer
		return () => clearTimeout(timer);
	}, [pendingViews, isProcessing]);

	// Initialize view counts from initial post data - now uses useRef to prevent re-renders
	const initializeViewCount = useCallback((postId, initialCount) => {
		if (
			postId &&
			typeof initialCount === "number" &&
			!initializedPosts.current.has(postId)
		) {
			initializedPosts.current.add(postId);
			setViewCounts((prev) => {
				// Only update if the count doesn't exist or is different
				if (prev[postId] !== initialCount) {
					return {
						...prev,
						[postId]: initialCount,
					};
				}
				return prev;
			});
		}
	}, []);

	// Context value - wrap in useMemo to avoid unnecessary re-renders
	const value = {
		trackView,
		getViewCount,
		initializeViewCount,
	};

	return (
		<ViewTrackingContext.Provider value={value}>
			{children}
		</ViewTrackingContext.Provider>
	);
};

// Custom hook for using the view tracking context
export const useViewTracking = () => {
	const context = useContext(ViewTrackingContext);
	if (!context) {
		throw new Error(
			"useViewTracking must be used within a ViewTrackingProvider"
		);
	}
	return context;
};
