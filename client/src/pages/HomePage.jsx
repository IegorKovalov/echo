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
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			<main className="flex-1">
				<div className="container grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-3 lg:grid-cols-4">
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
