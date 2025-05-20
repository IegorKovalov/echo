import { ArrowDown, MessageCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PostForm from "../UI/PostForm";
import PostItem from "../UI/PostItem";

export default function PostFeed({
	user,
	posts,
	loadingPosts,
	hasMore,
	loadMorePosts,
	createPost,
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const observerRef = useRef(null);
	const lastPostRef = useRef(null);

	const handleCreatePost = useCallback(
		async (formData) => {
			try {
				setIsSubmitting(true);
				await createPost(formData);
			} catch (error) {
				console.error("Error creating post:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[createPost]
	);

	const handleLoadMore = useCallback(async () => {
		if (loadingPosts || loadingMore || !hasMore) return;

		try {
			setLoadingMore(true);
			await loadMorePosts();
		} catch (error) {
			console.error("Error loading more posts:", error);
		} finally {
			setLoadingMore(false);
		}
	}, [loadingPosts, loadingMore, hasMore, loadMorePosts]);

	// Setup intersection observer for infinite scrolling
	useEffect(() => {
		const currentObserver = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting && hasMore && !loadingPosts && !loadingMore) {
					handleLoadMore();
				}
			},
			{ threshold: 0.5 }
		);

		observerRef.current = currentObserver;

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [hasMore, loadingPosts, loadingMore, handleLoadMore]);

	// Attach observer to last post element
	useEffect(() => {
		if (
			!loadingPosts &&
			posts.length > 0 &&
			lastPostRef.current &&
			observerRef.current
		) {
			observerRef.current.disconnect();
			observerRef.current.observe(lastPostRef.current);
		}
	}, [posts, loadingPosts]);

	const visiblePosts = posts.filter((post) => !post.expired);

	return (
		<div className="md:col-span-2 lg:col-span-2">
			{/* Post Form */}
			<PostForm
				user={user}
				onSubmit={handleCreatePost}
				isSubmitting={isSubmitting}
				initialMedia={[]}
			/>

			{/* Posts Feed */}
			<div className="space-y-6 mt-6">
				{loadingPosts && posts.length === 0 ? (
					<div className="text-center py-12 px-8 rounded-xl border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm shadow-xl">
						<Sparkles className="mx-auto h-10 w-10 text-purple-500 pulse-purple" />
						<p className="mt-4 text-gray-300 font-medium">Loading posts...</p>
						<div className="mt-4 w-40 h-1 bg-gray-800/80 rounded-full mx-auto overflow-hidden">
							<div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shimmer"></div>
						</div>
					</div>
				) : visiblePosts.length > 0 ? (
					<>
						{visiblePosts.map((post, index) => {
							// Set ref for the last post for infinite scrolling
							if (index === visiblePosts.length - 1) {
								return (
									<div key={post._id} ref={lastPostRef} className="transition-all duration-300">
										<PostItem post={post} currentUser={user} />
									</div>
								);
							}
							return (
								<div key={post._id} className="transition-all duration-300">
									<PostItem post={post} currentUser={user} />
								</div>
							);
						})}

						{/* Show loading indicator when loading more posts */}
						{loadingMore && (
							<div className="text-center py-6 px-6 rounded-lg bg-gray-900/40 border border-gray-800/50 backdrop-blur-sm shadow-md">
								<Sparkles className="mx-auto h-6 w-6 text-purple-500 pulse-purple" />
								<p className="mt-3 text-sm text-gray-300">Loading more posts...</p>
								<div className="mt-3 w-32 h-1 bg-gray-800/80 rounded-full mx-auto overflow-hidden">
									<div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shimmer"></div>
								</div>
							</div>
						)}

						{/* Show load more button if there are more posts but not loading */}
						{hasMore && !loadingMore && (
							<div className="text-center py-5">
								<button
									onClick={handleLoadMore}
									className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md shadow-purple-900/20 transition-all duration-200"
								>
									<ArrowDown className="h-4 w-4" />
									Load more
								</button>
							</div>
						)}

						{/* Show end of feed message when no more posts */}
						{!hasMore && posts.length > 0 && (
							<div className="text-center py-6 px-6 rounded-lg bg-gray-900/40 border border-gray-800/50 backdrop-blur-sm shadow-md">
								<p className="text-sm text-gray-300">You've reached the end of your feed</p>
							</div>
						)}
					</>
				) : (
					<div className="rounded-xl border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm p-10 text-center shadow-xl">
						<div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-5 flex items-center justify-center shadow-inner">
							<MessageCircle className="h-10 w-10 text-gray-400" />
						</div>
						<h3 className="text-xl font-medium text-white mb-3">No posts yet</h3>
						<p className="mt-2 text-gray-400 max-w-sm mx-auto">
							Create your first Echo or follow more users to see their posts.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
