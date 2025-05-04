import { Clock, Eye, MessageCircle, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PostService from "../../services/post.service";
import Card from "./Card";
import ProfileAvatar from "./ProfileAvatar";

/**
 * Reusable component for displaying posts consistently throughout the app
 */
export default function PostItem({
	post,
	currentUser,
	showActions = true,
	onDelete,
	onRenew,
}) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRenewing, setIsRenewing] = useState(false);
	const [viewCount, setViewCount] = useState(post.views || 0);
	const [hasTrackedView, setHasTrackedView] = useState(false);

	// Track view once per component mount
	useEffect(() => {
		const trackView = async () => {
			if (!hasTrackedView && !post.expired) {
				try {
					const response = await PostService.incrementViews(post._id);
					if (response.data && response.data.views) {
						setViewCount(response.data.views);
					}
					setHasTrackedView(true);
				} catch (error) {
					console.error("Error tracking view:", error);
				}
			}
		};

		trackView();
	}, [post._id, post.expired, hasTrackedView]);

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this post?")) {
			setIsDeleting(true);
			try {
				await onDelete(post._id);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleRenew = async () => {
		setIsRenewing(true);
		try {
			await onRenew(post._id);
		} finally {
			setIsRenewing(false);
		}
	};

	// Hours left until expiration
	const getHoursLeft = () => {
		if (!post.expiresAt) return 0;
		return Math.ceil(
			(new Date(post.expiresAt) - new Date()) / (1000 * 60 * 60)
		);
	};

	// Format date for readability
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})}`;
	};

	return (
		<Card className="mb-4">
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<ProfileAvatar user={post.user || currentUser} size="sm" />
					<div>
						<h3 className="font-medium text-white">
							{post.user?.fullName || currentUser?.fullName || "User"}
						</h3>
						<p className="text-xs text-gray-400">
							{formatDate(post.createdAt)}
						</p>
					</div>
				</div>

				{!post.expired ? (
					<div className="flex items-center gap-1 rounded-full bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-400">
						<Clock className="h-3 w-3" />
						<span>{getHoursLeft()}h left</span>
					</div>
				) : (
					<div className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-1 text-xs font-medium text-gray-400">
						<Clock className="h-3 w-3" />
						<span>Expired</span>
					</div>
				)}
			</div>

			<p className="mb-4 text-sm text-gray-200">{post.content}</p>

			{post.image && (
				<img
					src={post.image}
					alt="Post"
					className="mb-4 h-64 w-full rounded-lg object-cover"
				/>
			)}

			{showActions && (
				<div className="flex items-center justify-between border-t border-gray-800 pt-3">
					<div className="flex gap-4">
						<button className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400">
							<MessageCircle className="h-4 w-4" />
							<span>{post.comments ? post.comments.length : 0} comments</span>
						</button>

						<button className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400">
							<Send className="h-4 w-4" />
							<span>Share</span>
						</button>

						<div className="flex items-center gap-1 text-xs text-gray-400">
							<Eye className="h-4 w-4" />
							<span>{viewCount} views</span>
						</div>
					</div>

					<div className="flex gap-2">
						{!post.expired && onRenew && (
							<button
								onClick={handleRenew}
								disabled={isRenewing}
								className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
							>
								{isRenewing ? "Renewing..." : "Renew"}
							</button>
						)}

						{onDelete && (
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="rounded-full bg-red-600/20 p-1 text-red-400 hover:bg-red-600/40 disabled:opacity-50"
							>
								<Trash2 className="h-4 w-4" />
								<span className="sr-only">Delete</span>
							</button>
						)}
					</div>
				</div>
			)}
		</Card>
	);
}
