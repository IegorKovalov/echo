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
import { Link } from "react-router-dom";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import { useViewTracking } from "../../context/ViewTrackingContext";
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
	const [commentCount, setCommentCount] = useState(0);
	const [isEditing, setIsEditing] = useState(false);
	const [currentPost, setCurrentPost] = useState(post);
	const { showSuccess, showError, showInfo } = useToast();
	const { trackView, getViewCount, initializeViewCount } = useViewTracking();
	const { updatePost, deletePost, renewPost, addComment, deleteComment } =
		usePost();
	const initializedRef = useRef(false);

	const isOwnPost =
		currentUser && currentPost.user && currentUser._id === currentPost.user._id;

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
				await deletePost(currentPost._id);
				// If parent component provided a custom onDelete handler, call it too
				if (onDelete) {
					onDelete(currentPost._id);
				}
			} catch (error) {
				console.error("Error deleting post:", error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleRenew = async () => {
		setIsRenewing(true);
		try {
			const renewedPost = await renewPost(currentPost._id);
			setCurrentPost(renewedPost);
			// If parent component provided a custom onRenew handler, call it too
			if (onRenew) {
				onRenew(currentPost._id);
			}
		} catch (error) {
			console.error("Error renewing post:", error);
		} finally {
			setIsRenewing(false);
		}
	};

	const handleEdit = async (updatedPostData) => {
		try {
			const updatedPost = await updatePost(currentPost._id, updatedPostData);
			setCurrentPost(updatedPost);
			setIsEditing(false);
			// If parent component provided a custom onEdit handler, call it too
			if (onEdit) {
				onEdit(updatedPost);
			}
		} catch (error) {
			console.error("Error updating post:", error);
		}
	};

	// Handle comment count updates
	const handleCommentUpdate = async (updatedComments) => {
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
					initialMedia={currentPost.media || []} // Pass the existing media array
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
						{/* Make user name clickable and navigate to their profile */}
						{currentPost.user && currentPost.user._id ? (
							<Link
								to={`/profile/${currentPost.user._id}`}
								className="font-medium text-white hover:text-purple-400 transition-colors"
							>
								{currentPost.user?.fullName || currentUser?.fullName || "User"}
							</Link>
						) : (
							<h3 className="font-medium text-white">
								{currentPost.user?.fullName || currentUser?.fullName || "User"}
							</h3>
						)}
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

			{/* Render media items (images or videos) */}
			{currentPost.media && currentPost.media.length > 0 && (
				<div className="mb-4 space-y-2">
					{" "}
					{/* Container for media items, adds space between them */}
					{currentPost.media.map((mediaItem, index) => (
						<div
							key={mediaItem.publicId || index}
							className="rounded-lg overflow-hidden"
						>
							{" "}
							{/* Individual media item wrapper */}
							{mediaItem.type === "image" && (
								<img
									src={mediaItem.url}
									alt={`Post media ${index + 1}`}
									className="h-auto w-full max-h-[600px] object-contain rounded-lg" // Max height, object-contain to show full image
								/>
							)}
							{mediaItem.type === "video" && (
								<video
									src={mediaItem.url}
									controls
									className="h-auto w-full max-h-[600px] rounded-lg bg-black" // Max height, background color for letterboxing
								>
									Your browser does not support the video tag.
								</video>
							)}
						</div>
					))}
				</div>
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
						{!currentPost.expired && isOwnPost && (
							<button
								onClick={handleRenew}
								disabled={isRenewing}
								className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
							>
								{isRenewing ? "Renewing..." : "Renew"}
							</button>
						)}

						{/* Edit button - only show if the post belongs to the current user */}
						{isOwnPost && (
							<button
								onClick={() => setIsEditing(true)}
								className="rounded-full bg-blue-600/20 p-1 text-blue-400 hover:bg-blue-600/40"
							>
								<Edit2 className="h-4 w-4" />
								<span className="sr-only">Edit</span>
							</button>
						)}

						{isOwnPost && (
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
					onAddComment={addComment}
					onDeleteComment={deleteComment}
				/>
			)}
		</Card>
	);
}
