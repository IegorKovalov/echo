import { Clock, ImageIcon, Sparkles } from "lucide-react";
import React from "react";

export default function ProfileMedia({
	loadingPosts,
	posts,
	showExpiredPosts,
	setShowExpiredPosts,
	isOwnProfile,
}) {
	// Filter posts to only include those with images
	const mediaPosts = posts.filter((post) => post.image);

	return (
		<div>
			{/* Media Filter Toggle - only show on own profile */}
			<div className="container mt-4 px-4">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-white">
						{isOwnProfile ? "Your Media" : "Media"}
					</h3>
					{isOwnProfile && (
						<label className="flex items-center text-sm text-gray-400">
							<input
								type="checkbox"
								checked={showExpiredPosts}
								onChange={(e) => setShowExpiredPosts(e.target.checked)}
								className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
							/>
							Show expired posts
						</label>
					)}
				</div>
			</div>

			{/* Media Content */}
			<div className="container mt-4 px-4 pb-16">
				{loadingPosts ? (
					<div className="mt-8 text-center">
						<Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-500" />
						<p className="mt-2 text-gray-400">Loading...</p>
					</div>
				) : mediaPosts.length === 0 ? (
					<div className="mt-8 rounded-lg bg-gray-900 p-8 text-center">
						<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
							<ImageIcon className="h-8 w-8 text-gray-600" />
						</div>
						<h3 className="text-lg font-medium text-white">
							No media uploads yet
						</h3>
						<p className="mt-2 text-gray-400">
							{isOwnProfile
								? "When you share photos or videos, they'll appear here."
								: "This user hasn't shared any photos or videos yet."}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
						{/* Media Grid */}
						{mediaPosts.map((post) => (
							<div
								key={post._id}
								className="group relative aspect-square overflow-hidden rounded-lg"
							>
								<img
									src={post.image}
									alt="Media"
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
						))}
					</div>
				)}
			</div>
		</div>
	);
}
