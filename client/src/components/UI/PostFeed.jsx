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
					<div className="text-center py-12 px-8 rounded-xl border border-gray-800/70 bg-gray-900/70">
						<Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-500" />
						<p className="mt-3 text-gray-400">Loading posts...</p>
					</div>
				) : visiblePosts.length > 0 ? (
					<>
						{visiblePosts.map((post, index) => {
							// Set ref for the last post for infinite scrolling
							if (index === visiblePosts.length - 1) {
								return (
									<div key={post._id} ref={lastPostRef} className="transition-all duration-300 hover:translate-y-[-2px]">
										<PostItem post={post} currentUser={user} />
									</div>
								);
							}
							return (
								<div key={post._id} className="transition-all duration-300 hover:translate-y-[-2px]">
									<PostItem post={post} currentUser={user} />
								</div>
							);
						})}

						{/* Show loading indicator when loading more posts */}
						{loadingMore && (
							<div className="text-center py-6 px-4 rounded-lg bg-gray-900/50 border border-gray-800/50">
								<Sparkles className="mx-auto h-6 w-6 animate-pulse text-purple-500" />
								<p className="mt-2 text-sm text-gray-400">Loading more posts...</p>
							</div>
						)}

						{/* Show load more button if there are more posts but not loading */}
						{hasMore && !loadingMore && (
							<div className="text-center py-5">
								<button
									onClick={handleLoadMore}
									className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/90 text-purple-400 hover:text-purple-300 shadow-md shadow-black/10 transition-all duration-200"
								>
									<ArrowDown className="h-4 w-4" />
									Load more
								</button>
							</div>
						)}

						{/* Show end of feed message when no more posts */}
						{!hasMore && posts.length > 0 && (
							<div className="text-center py-6 px-4 rounded-lg bg-gray-900/50 border border-gray-800/50">
								<p className="text-sm text-gray-400">You've reached the end of your feed</p>
							</div>
						)}
					</>
				) : (
					<div className="rounded-xl border border-gray-800/70 bg-gray-900/80 p-10 text-center shadow-lg shadow-black/10">
						<div className="mx-auto mb-5 h-16 w-16 rounded-full bg-gray-800/70 p-4 shadow-inner shadow-black/20">
							<MessageCircle className="h-8 w-8 text-gray-600" />
						</div>
						<h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
						<p className="mt-2 text-gray-400 max-w-sm mx-auto">
							Create your first Echo or follow more users to see their posts.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
