import { Clock, Eye, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileAvatar from "../UI/ProfileAvatar";

export default function TrendingSidebar({
	trendingPosts,
	loadingTrending,
	getHoursLeft,
}) {
	return (
		<div className="hidden lg:block lg:col-span-1">
			<div className="sticky top-20 rounded-xl border border-gray-800 bg-gray-900 p-4">
				<h3 className="mb-4 font-medium text-white flex items-center gap-2">
					<TrendingUp className="h-5 w-5 text-purple-400" />
					Trending Echoes
				</h3>

				{loadingTrending ? (
					<div className="py-12 text-center">
						<Sparkles className="mx-auto h-6 w-6 animate-pulse text-purple-500" />
						<p className="mt-2 text-xs text-gray-400">Loading trends...</p>
					</div>
				) : trendingPosts.length === 0 ? (
					<div className="py-8 text-center">
						<p className="text-sm text-gray-400">No trending posts yet</p>
					</div>
				) : (
					<div className="space-y-4">
						{trendingPosts.map((post) => (
							<div
								key={post._id}
								className="rounded-lg bg-gray-800/50 p-3 hover:bg-gray-800 transition-colors"
							>
								<div className="flex items-center gap-2 mb-2">
									<ProfileAvatar user={post.user} size="xs" />
									<Link to={`/profile/${post.user._id}`}>
										<span className="text-xs font-medium text-white hover:text-purple-400 transition-colors">
											{post.user.fullName}
										</span>
									</Link>
								</div>

								<p className="text-xs text-gray-300 mb-2 line-clamp-2">
									{post.content}
								</p>

								<div className="flex items-center justify-between text-xs text-gray-400">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-1">
											<Eye className="h-3 w-3" />
											<span>{post.views}</span>
										</div>
										<div className="flex items-center gap-1">
											<MessageCircle className="h-3 w-3" />
											<span>{post.comments?.length || 0}</span>
										</div>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										<span>{getHoursLeft(post.expiresAt)}h left</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
