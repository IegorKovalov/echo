import { Trash2 } from "lucide-react";
import { useState } from "react";
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
				await onDelete(postId, comment._id);
			} catch (error) {
				console.error("Error deleting comment:", error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	return (
		<div className="flex gap-3 py-4 px-2">
			<ProfileAvatar user={comment.user} size="xs" />

			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between">
					<div>
						<span className="font-medium text-white">
							{comment.user?.fullName || "User"}
						</span>
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
