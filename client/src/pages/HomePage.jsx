import { Sparkles } from "lucide-react";
import MessageSidebar from "../components/UI/MessageSidebar";
import PostFeed from "../components/UI/PostFeed";
import TrendingSidebar from "../components/UI/TrendingSidebar";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";

export default function HomePage() {
	const { user, loading } = useAuth();
	const {
		posts,
		trendingPosts,
		loadingPosts,
		loadingTrending,
		loadMorePosts,
		hasMore,
		createPost,
		getHoursLeft,
	} = usePost();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center bg-gray-900/40 backdrop-blur-sm p-10 rounded-2xl border border-gray-800/50 shadow-xl float">
					<Sparkles className="mx-auto h-14 w-14 text-purple-500 pulse-purple" />
					<div className="mt-6 space-y-2">
						<p className="text-xl font-medium text-white">Loading your Echo feed...</p>
						<p className="text-gray-400">Please wait while we gather your moments</p>
					</div>
					<div className="mt-6 w-48 h-1.5 bg-gray-800/80 rounded-full mx-auto overflow-hidden">
						<div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shimmer"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<main className="flex-1 py-8">
				<div className="container grid grid-cols-1 gap-8 px-4 md:grid-cols-3 lg:grid-cols-4">
					{/* Message Sidebar */}
					<MessageSidebar />

					{/* Post Feed */}
					<PostFeed
						user={user}
						posts={posts}
						loadingPosts={loadingPosts}
						hasMore={hasMore}
						loadMorePosts={loadMorePosts}
						createPost={createPost}
					/>

					{/* Trending Sidebar */}
					<TrendingSidebar
						trendingPosts={trendingPosts}
						loadingTrending={loadingTrending}
						getHoursLeft={getHoursLeft}
					/>
				</div>
			</main>
		</div>
	);
}
