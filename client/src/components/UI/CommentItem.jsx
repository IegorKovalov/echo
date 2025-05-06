import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";

/**
 * Component for displaying individual comments
 */
export default function CommentItem({ comment, postId, onDelete }) {
	const { user } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);

	// Check if the current user is the author of the comment
	const isAuthor = user && comment.user && user._id === comment.user._id;

	// Format the date for displaying when the comment was posted
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

	// Handle comment deletion
	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this comment?")) {
			setIsDeleting(true);
			try {
				// Call the onDelete function passed from the parent
				await onDelete(postId, comment._id);
				// Note: We don't need to manually update UI here - parent should handle it
			} catch (error) {
				console.error("Error deleting comment:", error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	// If the comment is being deleted, you could show a visual indicator
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
								className="font-medium text-white hover:text-purple-400 transition-colors"
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
							className="rounded-full p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
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
	);
}
