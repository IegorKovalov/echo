// client/src/components/UI/CommentSection.jsx
import { Send } from "lucide-react";
import { useState } from "react";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import CommentItem from "./CommentItem";
import ProfileAvatar from "./ProfileAvatar";
import EmptyState from "./EmptyState";

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
	const comments = post.comments || [];

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!commentContent.trim()) return;

		setIsSubmitting(true);
		try {
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
			const deleteCommentFn = onDeleteComment || postContext.deleteComment;
			await deleteCommentFn(postId, commentId);
			showSuccess("Comment deleted successfully");
		} catch (error) {
			console.error("Error deleting comment:", error);
			showError(error.message || "Failed to delete comment");
		}
	};
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
						className="w-full rounded-full border border-gray-800/80 bg-gray-900/50 pl-4 pr-12 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
						disabled={isSubmitting}
					/>
					<button
						type="submit"
						disabled={!commentContent.trim() || isSubmitting}
						className="absolute right-1.5 top-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-sm shadow-purple-900/20"
					>
						<Send className="h-4 w-4" />
						<span className="sr-only">Post comment</span>
					</button>
				</div>
			</form>

			{/* Comment list */}
			{comments.length > 0 ? (
				<div className="mt-2">
					{hasMoreComments && !isExpanded && (
						<button
							onClick={() => setIsExpanded(true)}
							className="mb-3 ml-2 text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
						>
							View all {comments.length} comments
						</button>
					)}

					<div className="border-t border-gray-800/50 pt-3">
						{displayedComments.map((comment) => (
							<div
								key={comment._id}
								className="border-b border-gray-800/30 last:border-b-0 hover:bg-gray-800/30 transition-colors duration-200 rounded-md"
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
							className="mt-3 ml-2 mb-2 text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
						>
							Show less
						</button>
					)}
				</div>
			) : (
				<div className="border-t border-gray-800/50 pt-4 pb-4">
					<EmptyState message="Be the first to comment on this post" />
				</div>
			)}
		</div>
	);
}
