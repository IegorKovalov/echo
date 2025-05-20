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
	const isMounted = useRef(true);

	// Add cleanup for the component
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (!initializedRef.current) {
			initializedRef.current = true;
			initializeViewCount(post._id, post.views || 0);
		}
	}, [post._id, post.views, initializeViewCount]);

	useEffect(() => {
		// Only track views once and only for non-expired posts
		if (!hasTrackedView && !post.expired) {
			trackView(post._id);
			setHasTrackedView(true);
		}

		// No cleanup needed - view tracking is batched at context level
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
				if (isMounted.current) {
					showError("Failed to delete post");
				}
			} finally {
				if (isMounted.current) {
					setIsDeleting(false);
				}
			}
		}
	};

	const handleRenew = async () => {
		setIsRenewing(true);
		try {
			const renewedPost = await renewPost(post._id);
			if (onRenew && isMounted.current) {
				onRenew(post._id);
			}
			return renewedPost;
		} catch (error) {
			console.error("Error renewing post:", error);
			if (isMounted.current) {
				showError("Failed to renew post");
			}
		} finally {
			if (isMounted.current) {
				setIsRenewing(false);
			}
		}
	};

	const handleEdit = async (updatedPostData) => {
		setIsSubmitting(true);
		try {
			// Make a copy of the form data entries for debugging
			if (updatedPostData instanceof FormData) {
				console.log("Media files in form:", updatedPostData.getAll('media'));
				console.log("Existing media IDs:", updatedPostData.getAll('existingMediaIds'));
			}
			
			const updatedPost = await updatePost(post._id, updatedPostData);
			if (isMounted.current) {
				setIsEditing(false);
				if (onEdit) {
					onEdit(updatedPost);
				}
			}
			return updatedPost;
		} catch (error) {
			console.error("Error updating post:", error);
			if (isMounted.current) {
				showError("Failed to update post");
			}
		} finally {
			if (isMounted.current) {
				setIsSubmitting(false);
			}
		}
	};

	const handleShare = () => {
		const postUrl = `${window.location.origin}/post/${post._id}`;
		navigator.clipboard
			.writeText(postUrl)
			.then(() => {
				if (isMounted.current) {
					showInfo("Post link copied to clipboard");
				}
			})
			.catch(() => {
				if (isMounted.current) {
					showError("Failed to copy link");
				}
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
		console.log("Editing post with media:", post.media);
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
		<Card className="mb-4 overflow-visible">
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
					<div className="flex items-center gap-1.5 rounded-full bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-400 shadow-sm border border-purple-900/20">
						<Clock className="h-3 w-3" />
						<span>{getHoursLeft()}h left</span>
					</div>
				) : (
					<div className="flex items-center gap-1.5 rounded-full bg-gray-800/70 px-3 py-1 text-xs font-medium text-gray-400 border border-gray-800/50">
						<Clock className="h-3 w-3" />
						<span>Expired</span>
					</div>
				)}
			</div>

			{/* Post Content */}
			<div className="mb-4">
				<p className="text-white/90 whitespace-pre-wrap break-words">{post.content}</p>
			</div>

			{/* Post Media - Modern Style */}
			{post.media && post.media.length > 0 && (
				<div className="mb-4 overflow-hidden rounded-xl bg-gray-900/30">
					{post.media.length === 1 ? (
						<div className="aspect-video relative">
							{(post.media[0].type === "image" || post.media[0].type?.startsWith("image/")) && (
								<img
									src={post.media[0].url}
									alt="Post media"
									className="h-full w-full object-cover"
								/>
							)}
							{(post.media[0].type === "video" || post.media[0].type?.startsWith("video/")) && (
								<video
									src={post.media[0].url}
									controls
									className="h-full w-full object-cover bg-black"
								>
									Your browser does not support the video tag.
								</video>
							)}
						</div>
					) : (
						<div className={`grid gap-1 ${
							post.media.length === 2 ? 'grid-cols-2' : 
							post.media.length === 3 ? 'grid-cols-3' : 
							'grid-cols-2'
						}`}>
							{post.media.map((mediaItem, index) => {
								// Only show the first 4 items in the grid view
								if (post.media.length > 4 && index > 3) return null;
								
								return (
									<div
										key={`media-${mediaItem._id || mediaItem.publicId || index}-${Date.now()}`}
										className={`overflow-hidden ${post.media.length === 4 && index >= 2 ? 'col-span-1' : post.media.length > 4 && index === 0 ? 'col-span-2 row-span-2' : ''} relative`}
									>
										{(mediaItem.type === "image" || mediaItem.type?.startsWith("image/")) && (
											<div className="aspect-square">
												<img
													src={mediaItem.url}
													alt={`Post media ${index + 1}`}
													className="h-full w-full object-cover"
												/>
											</div>
										)}
										{(mediaItem.type === "video" || mediaItem.type?.startsWith("video/")) && (
											<div className="aspect-square relative">
												<video
													src={mediaItem.url}
													className="h-full w-full object-cover bg-black"
												>
													Your browser does not support the video tag.
												</video>
												<div className="absolute inset-0 flex items-center justify-center">
													<button 
														onClick={(e) => {
															e.stopPropagation();
															// Create a fullscreen modal with the video
															const modal = document.createElement('div');
															modal.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center';
															modal.onclick = () => modal.remove();
															
															const videoElement = document.createElement('video');
															videoElement.src = mediaItem.url;
															videoElement.className = 'max-h-screen max-w-screen-lg';
															videoElement.controls = true;
															videoElement.autoplay = true;
															
															modal.appendChild(videoElement);
															document.body.appendChild(modal);
														}}
														className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center text-white"
													>
														<Send className="h-5 w-5 transform rotate-90" />
													</button>
												</div>
											</div>
										)}
										{post.media.length > 4 && index === 3 && (
											<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
												<span className="text-white text-xl font-bold">+{post.media.length - 4}</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* Post Actions */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					{/* View count */}
					<div className="flex items-center gap-1 text-gray-400 text-sm">
						<Eye className="h-4 w-4" />
						<span>{viewCount}</span>
					</div>

					{/* Comment button */}
					<button
						onClick={() => setShowComments(!showComments)}
						className="flex items-center gap-1 text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
					>
						<MessageCircle className="h-4 w-4" />
						<span>{commentCount}</span>
					</button>
				</div>

				{/* Admin actions */}
				{showActions && isOwnPost && !post.expired && (
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsEditing(true)}
							className="rounded-md bg-gray-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700 transition-colors duration-200"
						>
							<Edit2 className="h-3.5 w-3.5" />
							<span className="sr-only">Edit</span>
						</button>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="rounded-md bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-900/50 transition-colors duration-200"
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete</span>
						</button>
					</div>
				)}

				{/* Renew Post button */}
				{showActions && post.expired && isOwnPost && (
					<button
						onClick={handleRenew}
						disabled={isRenewing}
						className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70 transition-colors duration-200"
					>
						{isRenewing ? "Renewing..." : "Renew Post"}
					</button>
				)}
			</div>

			{/* Comments section */}
			{showComments && (
				<div className="mt-4 pt-4 border-t border-gray-800/50">
					<CommentSection
						post={post}
						onAddComment={addComment}
						onDeleteComment={deleteComment}
						currentUser={user}
					/>
				</div>
			)}
		</Card>
	);
}
