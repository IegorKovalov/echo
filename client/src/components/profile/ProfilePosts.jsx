import { MessageCircle, Sparkles } from "lucide-react";
import React from "react";
import PostForm from "../UI/PostForm";
import PostItem from "../UI/PostItem";
import LoadingSpinner from "../UI/LoadingSpinner";
import EmptyState from "../UI/EmptyState";

export default function ProfilePosts({
	loadingPosts,
	posts,
	profileData,
	handleDeletePost,
	handleRenewPost,
	showExpiredPosts,
	setShowExpiredPosts,
	handleCreatePost,
	isSubmitting,
	isOwnProfile,
}) {
	return (
		<div>
			{/* Post Creation Form - only show on own profile */}
			{isOwnProfile && (
				<div className="container px-4 mt-8">
					<PostForm
						user={profileData}
						onSubmit={handleCreatePost}
						isSubmitting={isSubmitting}
						initialMedia={[]}
					/>
				</div>
			)}

			{/* Post Filter Toggle - only show expired toggle on own profile */}
			<div className="container mt-4 px-4">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-white">
						{isOwnProfile ? "Your Echoes" : "Echoes"}
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

			{/* Post Content */}
			<div className="container mt-4 px-4 pb-16">
				{loadingPosts ? (
					<div className="mt-8 text-center">
						<LoadingSpinner />
					</div>
				) : posts.length === 0 ? (
					<div className="mt-8 text-center">
						<EmptyState 
							message={isOwnProfile 
								? "Create your first Echo using the form above."
								: "This user hasn\'t posted any Echoes yet."}
						/>
					</div>
				) : (
					<div className="space-y-6 max-w-2xl mx-auto">
						{/* Post List using PostItem component */}
						{posts.map((post) => (
							<PostItem
								key={post._id}
								post={post}
								currentUser={profileData}
								onDelete={isOwnProfile ? handleDeletePost : undefined}
								onRenew={isOwnProfile ? handleRenewPost : undefined}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
