import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import CommentItem from "./CommentItem";
import ProfileAvatar from "./ProfileAvatar";

/**
 * Component for displaying and managing comments on a post
 */
export default function CommentSection({
	post,
	currentUser,
	onCommentUpdate,
	onAddComment,
	onDeleteComment,
}) {
	const [comments, setComments] = useState(post.comments || []);
	const [commentContent, setCommentContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const { showSuccess, showError } = useToast();
	// Use post context if props aren't provided
	const postContext = usePost();

	// Sync comments with post prop when it changes
	useEffect(() => {
		setComments(post.comments || []);
	}, [post.comments]);

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!commentContent.trim()) return;

		setIsSubmitting(true);
		try {
			const addCommentFn = onAddComment || postContext.addComment;
			const response = await addCommentFn(post._id, commentContent.trim());
			let updatedComments;
			if (
				response &&
				response.data &&
				response.data.post &&
				response.data.post.comments
			) {
				updatedComments = response.data.post.comments;
			} else if (response && response.comments) {
				updatedComments = response.comments;
			} else if (response) {
				// If direct post object returned
				updatedComments = response.comments || [];
			} else {
				// Fallback: Add the new comment locally
				const newComment = {
					_id: Date.now().toString(), // Temporary ID
					content: commentContent.trim(),
					user: currentUser,
					createdAt: new Date().toISOString(),
				};
				updatedComments = [...comments, newComment];
			}

			setComments(updatedComments);

			// Notify parent component that comments have been updated
			if (onCommentUpdate) {
				onCommentUpdate(updatedComments);
			}

			// Show success toast
			showSuccess("Comment added successfully");
			setCommentContent("");
		} catch (error) {
			console.error("Error adding comment:", error);
			showError(error.message || "Failed to add comment");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Delete a comment
	const handleDeleteComment = async (postId, commentId) => {
		try {
			// Use the provided onDeleteComment or the postContext method
			const deleteCommentFn = onDeleteComment || postContext.deleteComment;
			const response = await deleteCommentFn(postId, commentId);

			// Handle the response data properly
			let updatedComments;
			if (
				response &&
				response.data &&
				response.data.post &&
				response.data.post.comments
			) {
				updatedComments = response.data.post.comments;
			} else if (response && response.comments) {
				updatedComments = response.comments;
			} else if (response) {
				// If direct post object returned
				updatedComments = response.comments || [];
			} else {
				// Fallback: Remove the comment locally if API doesn't return updated comments
				updatedComments = comments.filter((c) => c._id !== commentId);
			}

			setComments(updatedComments);

			// Notify parent component that comments have been updated
			if (onCommentUpdate) {
				onCommentUpdate(updatedComments);
			}

			// Show success toast
			showSuccess("Comment deleted successfully");
		} catch (error) {
			console.error("Error deleting comment:", error);
			showError(error.message || "Failed to delete comment");
		}
	};

	// Show all comments or just the most recent ones
	const displayedComments = isExpanded ? comments : comments.slice(-3);
	const hasMoreComments = comments.length > 3;

	return (
		<div className="mt-4 pt-1">
			{/* Comment form */}
			<form onSubmit={handleAddComment} className="flex gap-3 mb-4 px-1">
				<ProfileAvatar user={currentUser} size="xs" />
				<div className="relative flex-1">
					<input
						type="text"
						value={commentContent}
						onChange={(e) => setCommentContent(e.target.value)}
						placeholder="Add a comment..."
						className="w-full rounded-full border border-gray-800 bg-gray-800 pl-4 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
						disabled={isSubmitting}
					/>
				</div>
				<button
					type="submit"
					disabled={!commentContent.trim() || isSubmitting}
					className="rounded-full bg-purple-600 p-2.5 text-white hover:bg-purple-700 disabled:opacity-50"
				>
					<Send className="h-5 w-5" />
					<span className="sr-only">Post comment</span>
				</button>
			</form>

			{/* Comment list */}
			{comments.length > 0 ? (
				<div className="mt-2">
					{hasMoreComments && !isExpanded && (
						<button
							onClick={() => setIsExpanded(true)}
							className="mb-3 ml-2 text-xs text-purple-400 hover:text-purple-300"
						>
							View all {comments.length} comments
						</button>
					)}

					<div className="border-t border-gray-800 pt-2">
						{displayedComments.map((comment) => (
							<div
								key={comment._id}
								className="border-b border-gray-800 last:border-b-0"
							>
								<CommentItem
									comment={comment}
									postId={post._id}
									onDelete={handleDeleteComment}
								/>
							</div>
						))}
					</div>

					{isExpanded && comments.length > 3 && (
						<button
							onClick={() => setIsExpanded(false)}
							className="mt-3 ml-2 mb-2 text-xs text-purple-400 hover:text-purple-300"
						>
							Show less
						</button>
					)}
				</div>
			) : (
				<p className="text-center text-xs text-gray-500 py-4 border-t border-gray-800">
					Be the first to comment on this post
				</p>
			)}
		</div>
	);
}
