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
import { useAuth } from "../../context/AuthContext";
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
	const { user } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRenewing, setIsRenewing] = useState(false);
	const [hasTrackedView, setHasTrackedView] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { showSuccess, showError, showInfo } = useToast();
	const { trackView, getViewCount, initializeViewCount } = useViewTracking();
	const { updatePost, deletePost, renewPost, addComment, deleteComment } =
		usePost();

	const initializedRef = useRef(false);
	const isOwnPost = user._id === post.user._id;
	const commentCount = post.comments ? post.comments.length : 0;

	useEffect(() => {
		if (!initializedRef.current) {
			initializedRef.current = true;
			initializeViewCount(post._id, post.views || 0);
		}
	}, [post._id, post.views, initializeViewCount]);

	useEffect(() => {
		if (!hasTrackedView && !post.expired) {
			trackView(post._id);
			setHasTrackedView(true);
		}
	}, [post._id, post.expired, hasTrackedView, trackView]);

	const viewCount = getViewCount(post._id) || post.views || 0;

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this post?")) {
			setIsDeleting(true);
			try {
				if (onDelete) {
					await onDelete(post._id);
				} else {
					await deletePost(post._id);
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
			const renewedPost = await renewPost(post._id);
			if (onRenew) {
				onRenew(post._id);
			}
			return renewedPost;
		} catch (error) {
			console.error("Error renewing post:", error);
		} finally {
			setIsRenewing(false);
		}
	};

	const handleEdit = async (updatedPostData) => {
		setIsSubmitting(true);
		try {
			const updatedPost = await updatePost(post._id, updatedPostData);
			setIsEditing(false);
			if (onEdit) {
				onEdit(updatedPost);
			}
			return updatedPost;
		} catch (error) {
			console.error("Error updating post:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleShare = () => {
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

	const getHoursLeft = () => {
		if (!post.expiresAt) return 0;
		return Math.ceil(
			(new Date(post.expiresAt) - new Date()) / (1000 * 60 * 60)
		);
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})}`;
	};

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
					initialMedia={post.media || []}
					isEditing={true}
					onSubmit={handleEdit}
					isSubmitting={isSubmitting}
				/>
			</Card>
		);
	}

	return (
		<Card className="mb-4 overflow-visible hover:border-gray-700/50 transition-all duration-200">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<ProfileAvatar user={post.user || currentUser} size="sm" />
					<div>
						{post.user && post.user._id ? (
							<Link
								to={`/profile/${post.user._id}`}
								className="font-medium text-white hover:text-purple-400 transition-colors duration-200"
							>
								{post.user?.fullName || currentUser?.fullName || "User"}
							</Link>
						) : (
							<h3 className="font-medium text-white">
								{post.user?.fullName || currentUser?.fullName || "User"}
							</h3>
						)}
						<p className="text-xs text-gray-400 mt-0.5">
							{formatDate(post.createdAt)}
						</p>
					</div>
				</div>

				{!post.expired ? (
					<div className="flex items-center gap-1.5 rounded-full bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-400 shadow-sm">
						<Clock className="h-3 w-3" />
						<span>{getHoursLeft()}h left</span>
					</div>
				) : (
					<div className="flex items-center gap-1.5 rounded-full bg-gray-800/70 px-3 py-1 text-xs font-medium text-gray-400">
						<Clock className="h-3 w-3" />
						<span>Expired</span>
					</div>
				)}
			</div>

			<p className="mb-5 text-sm leading-relaxed text-gray-200">{post.content}</p>

			{/* Render media items (images or videos) */}
			{post.media && post.media.length > 0 && (
				<div className="mb-5 space-y-3">
					{post.media.map((mediaItem, index) => (
						<div
							key={mediaItem.publicId || index}
							className="rounded-lg overflow-hidden ring-1 ring-white/5 shadow-md"
						>
							{mediaItem.type === "image" && (
								<img
									src={mediaItem.url}
									alt={`Post media ${index + 1}`}
									className="h-auto w-full max-h-[600px] object-contain rounded-lg hover:scale-[1.01] transition-transform duration-200"
								/>
							)}
							{mediaItem.type === "video" && (
								<video
									src={mediaItem.url}
									controls
									className="h-auto w-full max-h-[600px] rounded-lg bg-black"
								>
									Your browser does not support the video tag.
								</video>
							)}
						</div>
					))}
				</div>
			)}

			{showActions && (
				<div className="flex items-center justify-between border-t border-gray-800/80 pt-4 mt-1">
					<div className="flex gap-5">
						<button
							onClick={() => setShowComments(!showComments)}
							className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200"
						>
							<MessageCircle className="h-4 w-4" />
							<span>{commentCount} comments</span>
							{showComments ? (
								<ChevronUp className="h-3 w-3 ml-0.5" />
							) : (
								<ChevronDown className="h-3 w-3 ml-0.5" />
							)}
						</button>

						<button
							onClick={handleShare}
							className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200"
						>
							<Send className="h-4 w-4" />
							<span>Share</span>
						</button>

						<div className="flex items-center gap-1.5 text-xs text-gray-400">
							<Eye className="h-4 w-4" />
							<span>{viewCount} views</span>
						</div>
					</div>

					<div className="flex gap-2.5">
						{!post.expired && isOwnPost && (
							<button
								onClick={handleRenew}
								disabled={isRenewing}
								className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 shadow-md shadow-purple-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/30"
							>
								{isRenewing ? "Renewing..." : "Renew"}
							</button>
						)}

						{/* Edit button - only show if the post belongs to the current user */}
						{isOwnPost && (
							<button
								onClick={() => setIsEditing(true)}
								className="rounded-full bg-blue-600/20 p-1.5 text-blue-400 hover:bg-blue-600/30 transition-colors duration-200"
							>
								<Edit2 className="h-4 w-4" />
								<span className="sr-only">Edit</span>
							</button>
						)}

						{isOwnPost && (
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="rounded-full bg-red-600/20 p-1.5 text-red-400 hover:bg-red-600/30 transition-colors duration-200 disabled:opacity-50"
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
					onAddComment={addComment}
					onDeleteComment={deleteComment}
				/>
			)}
		</Card>
	);
}
