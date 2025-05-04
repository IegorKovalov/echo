import {
	ChevronDown,
	ChevronUp,
	Clock,
	Edit2,
	Eye,
	MessageCircle,
	Send,
	Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useViewTracking } from "../../context/ViewTrackingContext";
import PostService from "../../services/post.service";
import Card from "./Card";
import CommentSection from "./CommentSection";
import PostForm from "./PostForm";
import ProfileAvatar from "./ProfileAvatar";

export default function PostItem({
	post,
	currentUser,
	showActions = true,
	onDelete,
	onRenew,
	onEdit,
}) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRenewing, setIsRenewing] = useState(false);
	const [hasTrackedView, setHasTrackedView] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
	const [isEditing, setIsEditing] = useState(false);
	const { showSuccess, showError, showInfo } = useToast();
	const { trackView, getViewCount, initializeViewCount } = useViewTracking();
	const initializedRef = useRef(false);

	// Initialize view count - using the ref to prevent multiple calls
	useEffect(() => {
		// This will run only once per component mount
		if (!initializedRef.current) {
			initializedRef.current = true;
			// Initialize with the post's current view count
			initializeViewCount(post._id, post.views || 0);
		}
	}, [post._id, post.views, initializeViewCount]);

	// Update comment count when post comments change
	useEffect(() => {
		if (post.comments) {
			setCommentCount(post.comments.length);
		}
	}, [post.comments]);

	// Track view once per component mount using the batch system
	useEffect(() => {
		if (!hasTrackedView && !post.expired) {
			trackView(post._id);
			setHasTrackedView(true);
		}
	}, [post._id, post.expired, hasTrackedView, trackView]);

	// Get the current view count for this post
	const viewCount = getViewCount(post._id) || post.views || 0;

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this post?")) {
			setIsDeleting(true);
			try {
				await onDelete(post._id);
				showSuccess("Post deleted successfully");
			} catch (error) {
				showError(error.response?.data?.message || "Failed to delete post");
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleRenew = async () => {
		setIsRenewing(true);
		try {
			await onRenew(post._id);
			showSuccess("Post renewed for another 24 hours");
		} catch (error) {
			showError(error.response?.data?.message || "Failed to renew post");
		} finally {
			setIsRenewing(false);
		}
	};

	const handleEdit = async (updatedPostData) => {
		try {
			const updatedPost = await PostService.updatePost(
				post._id,
				updatedPostData
			);
			setIsEditing(false);
			if (onEdit) {
				onEdit(updatedPost);
			}
			showSuccess("Post updated successfully");
		} catch (error) {
			showError(error.response?.data?.message || "Failed to update post");
		}
	};

	// Handle comment count updates
	const handleCommentUpdate = (updatedComments) => {
		setCommentCount(updatedComments.length);
	};

	const handleShare = () => {
		// Copy post URL to clipboard
		const postUrl = `${window.location.origin}/post/${post._id}`;
		navigator.clipboard
			.writeText(postUrl)
			.then(() => {
				showInfo("Post link copied to clipboard");
			})
			.catch(() => {
				showError("Failed to copy link");
			});
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

	// Show edit form instead of post content when editing
	if (isEditing) {
		return (
			<Card className="mb-4">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<ProfileAvatar user={post.user || currentUser} size="sm" />
						<h3 className="font-medium text-white">Edit Post</h3>
					</div>
					<button
						onClick={() => setIsEditing(false)}
						className="text-xs text-gray-400 hover:text-purple-400"
					>
						Cancel
					</button>
				</div>

				<PostForm
					user={currentUser}
					initialContent={post.content}
					initialDuration={getHoursLeft()}
					isEditing={true}
					onSubmit={handleEdit}
				/>
			</Card>
		);
	}

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
						<button
							onClick={() => setShowComments(!showComments)}
							className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400"
						>
							<MessageCircle className="h-4 w-4" />
							<span>{commentCount} comments</span>
							{showComments ? (
								<ChevronUp className="h-3 w-3" />
							) : (
								<ChevronDown className="h-3 w-3" />
							)}
						</button>

						<button
							onClick={handleShare}
							className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400"
						>
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

						{/* Edit button - only show if the post belongs to the current user */}
						{currentUser && post.user && currentUser._id === post.user._id && (
							<button
								onClick={() => setIsEditing(true)}
								className="rounded-full bg-blue-600/20 p-1 text-blue-400 hover:bg-blue-600/40"
							>
								<Edit2 className="h-4 w-4" />
								<span className="sr-only">Edit</span>
							</button>
						)}

						{onDelete &&
							currentUser &&
							post.user &&
							currentUser._id === post.user._id && (
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

			{/* Comments Section */}
			{showComments && (
				<CommentSection
					post={post}
					currentUser={currentUser}
					onCommentUpdate={handleCommentUpdate}
				/>
			)}
		</Card>
	);
}
