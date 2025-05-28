import { Clock, Eye, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileAvatar from "../UI/ProfileAvatar";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

export default function TrendingSidebar({
	trendingPosts,
	loadingTrending,
	getHoursLeft,
}) {
	return (
		<div className="col-span-1">
			<div className="sticky top-20 rounded-xl border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm p-5 shadow-xl">
				<h3 className="mb-4 font-medium text-white flex items-center gap-2">
					<TrendingUp className="h-5 w-5 text-purple-400" />
					Trending Echoes
				</h3>

				{loadingTrending ? (
					<LoadingSpinner />
				) : trendingPosts.length === 0 ? (
					<EmptyState message="No trending posts yet" />
				) : (
					<div className="space-y-4">
						{trendingPosts.map((post) => (
							<div
								key={post._id}
								className="rounded-lg bg-gray-800/40 border border-gray-800/30 p-3.5 hover:bg-gray-800/60 transition-all duration-200 shadow-sm"
							>
								<div className="flex items-center gap-2 mb-2">
									<ProfileAvatar user={post.user} size="xs" />
									<Link to={`/profile/${post.user._id}`}>
										<span className="text-xs font-medium text-white hover:text-purple-400 transition-colors duration-200">
											{post.user.fullName}
										</span>
									</Link>
								</div>

								<p className="text-xs text-gray-200 mb-3 line-clamp-2">
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
									<div className="flex items-center gap-1.5 rounded-full bg-purple-900/20 px-2 py-0.5 text-purple-400 border border-purple-900/10">
										<Clock className="h-3 w-3" />
										<span>{getHoursLeft(post.expiresAt)}h</span>
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
