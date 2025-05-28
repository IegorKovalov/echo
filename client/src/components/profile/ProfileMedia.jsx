import { Clock, ImageIcon, Sparkles } from "lucide-react";
import React from "react";
import LoadingSpinner from "../UI/LoadingSpinner";
import EmptyState from "../UI/EmptyState";

export default function ProfileMedia({
	loadingPosts,
	posts,
	isOwnProfile,
}) {
	const mediaPosts = posts.filter((post) => post.media && post.media.length > 0);

	return (
		<div>
			{/* Media Content */}
			<div className="container mt-4 px-4 pb-16">
				{loadingPosts ? (
					<div className="mt-8 text-center">
						<LoadingSpinner />
					</div>
				) : mediaPosts.length === 0 ? (
					<div className="mt-8 text-center">
						<EmptyState 
							message={isOwnProfile 
								? "When you share photos or videos, they\'ll appear here."
								: "This user hasn\'t shared any photos or videos yet."}
						/>
					</div>
				) : (
					<div className="grid grid-cols-4 gap-4">
						{/* Media Grid */}
						{mediaPosts.map((post) =>
							post.media.map((mediaItem) => (
								<div
									key={`${post._id}-${mediaItem._id}`}
									className="relative aspect-square overflow-hidden rounded-lg"
								>
									{mediaItem.type === "image" ? (
										<img
											src={mediaItem.url}
											alt="Media"
											className="h-full w-full object-cover"
										/>
									) : (
										<video
											src={mediaItem.url}
											className="h-full w-full object-cover"
											controls
										/>
									)}
									{post.expired ? (
										<div className="absolute bottom-2 right-2 rounded-full bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">
											<Clock className="h-3 w-3" /> Expired
										</div>
									) : (
										<div className="absolute bottom-2 right-2 rounded-full bg-purple-900/60 px-2 py-1 text-xs font-medium text-purple-300">
											<Clock className="h-3 w-3" />{" "}
											{Math.ceil(
												(new Date(post.expiresAt) - new Date()) / (1000 * 60 * 60)
											)}
											h left
										</div>
									)}
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
}
