// client/src/components/UI/CommentSection.jsx
import { Send } from "lucide-react";
import { useState } from "react";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import CommentItem from "./CommentItem";
import ProfileAvatar from "./ProfileAvatar";

export default function CommentSection({
	post,
	currentUser,
	onAddComment,
	onDeleteComment,
}) {
	const [commentContent, setCommentContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const { showSuccess, showError } = useToast();
	const postContext = usePost();

	// Use post.comments directly, no need to duplicate state
	const comments = post.comments || [];

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!commentContent.trim()) return;

		setIsSubmitting(true);
		try {
			// Use the provided callback or the context method
			const addCommentFn = onAddComment || postContext.addComment;
			await addCommentFn(post._id, commentContent.trim());
			showSuccess("Comment added successfully");
			setCommentContent("");
		} catch (error) {
			console.error("Error adding comment:", error);
			showError(error.message || "Failed to add comment");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComment = async (postId, commentId) => {
		try {
			// Use the provided callback or the context method
			const deleteCommentFn = onDeleteComment || postContext.deleteComment;
			await deleteCommentFn(postId, commentId);

			// No need to update local state since we're using post.comments directly
			// The context will update the post with new comments

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
