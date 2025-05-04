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
	const [currentPost, setCurrentPost] = useState(post); // Track the current post state locally
	const { showSuccess, showError, showInfo } = useToast();
	const { trackView, getViewCount, initializeViewCount } = useViewTracking();
	const initializedRef = useRef(false);

	// Update local post state when prop changes
	useEffect(() => {
		setCurrentPost(post);
	}, [post]);

	// Initialize view count - using the ref to prevent multiple calls
	useEffect(() => {
		// This will run only once per component mount
		if (!initializedRef.current) {
			initializedRef.current = true;
			// Initialize with the post's current view count
			initializeViewCount(currentPost._id, currentPost.views || 0);
		}
	}, [currentPost._id, currentPost.views, initializeViewCount]);

	// Update comment count when post comments change
	useEffect(() => {
		if (currentPost.comments) {
			setCommentCount(currentPost.comments.length);
		}
	}, [currentPost.comments]);

	// Track view once per component mount using the batch system
	useEffect(() => {
		if (!hasTrackedView && !currentPost.expired) {
			trackView(currentPost._id);
			setHasTrackedView(true);
		}
	}, [currentPost._id, currentPost.expired, hasTrackedView, trackView]);

	// Get the current view count for this post
	const viewCount = getViewCount(currentPost._id) || currentPost.views || 0;

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this post?")) {
			setIsDeleting(true);
			try {
				await onDelete(currentPost._id);
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
			await onRenew(currentPost._id);
			const renewedPost = {
				...currentPost,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			};
			setCurrentPost(renewedPost);
			if (onEdit) {
				onEdit(renewedPost);
			}
			showSuccess("Post renewed for another 24 hours");
		} catch (error) {
			showError(error.response?.data?.message || "Failed to renew post");
		} finally {
			setIsRenewing(false);
		}
	};

	const handleEdit = async (updatedPostData) => {
		try {
			const response = await PostService.updatePost(
				currentPost._id,
				updatedPostData
			);

			// Extract the updated post from the response data
			// The server response structure is { status, data: { post: {...} } }
			const updatedPost = response.data?.post || {};

			// Ensure date fields are properly preserved from the original post if missing
			const processedPost = {
				...updatedPost,
				createdAt: updatedPost.createdAt || currentPost.createdAt,
				expiresAt: updatedPost.expiresAt || currentPost.expiresAt,
				// Make sure content is preserved if somehow missing in the response
				content: updatedPost.content || currentPost.content,
			};

			setCurrentPost(processedPost);
			setIsEditing(false);
			if (onEdit) {
				onEdit(processedPost);
			}
			// Success notification is shown in PostForm component
		} catch (error) {
			showError(error.response?.data?.message || "Failed to update post");
		}
	};

	// Handle comment count updates
	const handleCommentUpdate = (updatedComments) => {
		setCommentCount(updatedComments.length);
		// Update the local post state with new comments
		setCurrentPost((prev) => ({ ...prev, comments: updatedComments }));
		// Propagate changes upward if onEdit is provided
		if (onEdit) {
			onEdit({ ...currentPost, comments: updatedComments });
		}
	};

	const handleShare = () => {
		// Copy post URL to clipboard
		const postUrl = `${window.location.origin}/post/${currentPost._id}`;
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
		if (!currentPost.expiresAt) return 0;
		return Math.ceil(
			(new Date(currentPost.expiresAt) - new Date()) / (1000 * 60 * 60)
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
						<ProfileAvatar user={currentPost.user || currentUser} size="sm" />
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
					initialContent={currentPost.content}
					initialDuration={getHoursLeft()}
					initialImage={currentPost.image} // Pass the existing image URL
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
					<ProfileAvatar user={currentPost.user || currentUser} size="sm" />
					<div>
						<h3 className="font-medium text-white">
							{currentPost.user?.fullName || currentUser?.fullName || "User"}
						</h3>
						<p className="text-xs text-gray-400">
							{formatDate(currentPost.createdAt)}
						</p>
					</div>
				</div>

				{!currentPost.expired ? (
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

			<p className="mb-4 text-sm text-gray-200">{currentPost.content}</p>

			{currentPost.image && (
				<img
					src={currentPost.image}
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
						{!currentPost.expired && onRenew && (
							<button
								onClick={handleRenew}
								disabled={isRenewing}
								className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
							>
								{isRenewing ? "Renewing..." : "Renew"}
							</button>
						)}

						{/* Edit button - only show if the post belongs to the current user */}
						{currentUser &&
							currentPost.user &&
							currentUser._id === currentPost.user._id && (
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
							currentPost.user &&
							currentUser._id === currentPost.user._id && (
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
					post={currentPost}
					currentUser={currentUser}
					onCommentUpdate={handleCommentUpdate}
				/>
			)}
		</Card>
	);
}
