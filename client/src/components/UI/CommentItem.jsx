import { ReplyIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import ProfileAvatar from "./ProfileAvatar";
import ReplyItem from "./ReplyItem";

export default function CommentItem({ comment, postId, onDelete }) {
	const { user } = useAuth();
	const { addCommentReply, deleteCommentReply } = usePost();
	const { showSuccess, showError } = useToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [isSubmittingReply, setIsSubmittingReply] = useState(false);
	const [showReplies, setShowReplies] = useState(false);

	const isAuthor = user && comment.user && user._id === comment.user._id;

	const replies = comment.replies || [];
	const hasReplies = replies.length > 0;

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString();
	};

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this comment?")) {
			setIsDeleting(true);
			try {
				await onDelete(postId, comment._id);
				showSuccess("Comment deleted successfully");
			} catch (error) {
				showError(error.message || "Failed to delete comment");
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleSubmitReply = async (e) => {
		e.preventDefault();
		if (!replyContent.trim()) return;

		setIsSubmittingReply(true);
		try {
			await addCommentReply(
				postId,
				comment._id,
				replyContent,
				comment.user._id
			);
			setReplyContent("");
			setShowReplyForm(false);
			setShowReplies(true);
			showSuccess("Reply added successfully");
		} catch (error) {
			console.error("Error adding reply:", error);
			showError(error.message || "Failed to add reply");
		} finally {
			setIsSubmittingReply(false);
		}
	};

	const handleDeleteReply = async (postId, commentId, replyId) => {
		try {
			await deleteCommentReply(postId, commentId, replyId);
			showSuccess("Reply deleted successfully");
		} catch (error) {
			console.error("Error deleting reply:", error);
			showError(error.message || "Failed to delete reply");
		}
	};

	if (isDeleting) {
		return (
			<div className="flex gap-3 py-4 px-2 opacity-50">
				<ProfileAvatar user={comment.user} size="xs" />
				<div className="flex-1 min-w-0">
					<p className="text-sm text-gray-400">Deleting comment...</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Main comment - keep most of your existing comment UI */}
			<div className="flex gap-3 py-4 px-2">
				{/* Make avatar clickable too */}
				{comment.user && comment.user._id ? (
					<Link to={`/profile/${comment.user._id}`}>
						<ProfileAvatar user={comment.user} size="xs" />
					</Link>
				) : (
					<ProfileAvatar user={comment.user} size="xs" />
				)}

				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between">
						<div>
							{/* Make username clickable */}
							{comment.user && comment.user._id ? (
								<Link
									to={`/profile/${comment.user._id}`}
									className="font-medium text-white hover:text-purple-400 transition-colors duration-200"
								>
									{comment.user?.fullName || "User"}
								</Link>
							) : (
								<span className="font-medium text-white">
									{comment.user?.fullName || "User"}
								</span>
							)}
							<span className="ml-2 text-xs text-gray-400">
								{formatDate(comment.createdAt)}
							</span>
						</div>

						{isAuthor && (
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="rounded-full p-1.5 text-gray-500 hover:bg-gray-800/70 hover:text-red-400 transition-colors duration-200"
								aria-label="Delete comment"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						)}
					</div>

					<p className="mt-1.5 text-sm text-gray-300 break-words">
						{comment.content}
					</p>
				</div>
			</div>

			{/* Add a reply button next to comment actions */}
			<div className="flex items-center gap-2 ml-2 mb-2">
				<button
					onClick={() => setShowReplyForm(!showReplyForm)}
					className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200"
				>
					<ReplyIcon className="h-3 w-3" />
					<span>Reply</span>
				</button>

				{hasReplies && (
					<button
						onClick={() => setShowReplies(!showReplies)}
						className="text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200"
					>
						{showReplies
							? `Hide ${replies.length} ${
									replies.length === 1 ? "reply" : "replies"
							  }`
							: `View ${replies.length} ${
									replies.length === 1 ? "reply" : "replies"
							  }`}
					</button>
				)}
			</div>

			{/* Reply form */}
			{showReplyForm && (
				<form
					onSubmit={handleSubmitReply}
					className="flex gap-2 ml-10 mt-2 mb-3"
				>
					<ProfileAvatar user={user} size="2xs" />
					<div className="relative flex-1">
						<input
							type="text"
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							placeholder={`Reply to ${comment.user?.fullName || "user"}...`}
							className="w-full rounded-full border border-gray-800/80 bg-gray-900/50 pl-3 pr-10 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
							disabled={isSubmittingReply}
						/>
						<button
							type="submit"
							disabled={!replyContent.trim() || isSubmittingReply}
							className="absolute right-1 top-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-1 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
						>
							<ReplyIcon className="h-3 w-3" />
							<span className="sr-only">Reply</span>
						</button>
					</div>
				</form>
			)}

			{/* Replies section */}
			{showReplies && hasReplies && (
				<div className="ml-8 mt-1 pl-2 border-l border-gray-800/30 space-y-1">
					{replies.map((reply) => (
						<ReplyItem
							key={reply._id}
							reply={reply}
							postId={postId}
							commentId={comment._id}
							onDelete={handleDeleteReply}
						/>
					))}
				</div>
			)}
		</div>
	);
}
