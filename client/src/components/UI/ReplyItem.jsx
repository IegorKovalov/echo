import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";

export default function ReplyItem({ reply, postId, commentId, onDelete }) {
	const { user } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const isAuthor = user && reply.user && user._id === reply.user._id;
	console.log("ReplyItem", reply, postId, commentId, onDelete);
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
		if (window.confirm("Are you sure you want to delete this reply?")) {
			setIsDeleting(true);
			try {
				await onDelete(postId, commentId, reply._id);
			} catch (error) {
				console.error("Error deleting reply:", error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	if (isDeleting) {
		return (
			<div className="flex gap-3 py-3 px-2 opacity-50">
				<ProfileAvatar user={reply.user} size="xs" />
				<div className="flex-1 min-w-0">
					<p className="text-sm text-gray-400">Deleting reply...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3 py-3 px-2 ml-6 border-l border-gray-800 pl-3 hover:bg-gray-800/30 transition-colors">
			{reply.user && reply.user._id ? (
				<Link to={`/profile/${reply.user._id}`} className="flex items-center">
					<ProfileAvatar user={reply.user} size="xs" />
				</Link>
			) : (
				<ProfileAvatar user={reply.user} size="xs" />
			)}

			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between">
					<div>
						{reply.user && reply.user._id ? (
							<Link
								to={`/profile/${reply.user._id}`}
								className="font-medium text-white hover:text-purple-400 transition-colors"
							>
								{reply.user?.fullName || "User"}
							</Link>
						) : (
							<span className="font-medium text-white">
								{reply.user?.fullName || "User"}
							</span>
						)}

						{reply.replyToUser &&
							reply.replyToUser._id &&
							reply.replyToUser._id !== reply.user._id && (
								<>
									<span className="text-gray-500 mx-1">replying to</span>
									<Link
										to={`/profile/${reply.replyToUser._id}`}
										className="text-purple-400 hover:text-purple-300 transition-colors"
									>
										@{reply.replyToUser.username || "user"}
									</Link>
								</>
							)}

						<span className="ml-2 text-xs text-gray-400">
							{formatDate(reply.createdAt)}
						</span>
					</div>

					{isAuthor && (
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="rounded-full p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
							aria-label="Delete reply"
						>
							<Trash2 className="h-3 w-3" />
						</button>
					)}
				</div>

				<p className="mt-1 text-sm text-gray-300 break-words">
					{reply.content}
				</p>
			</div>
		</div>
	);
}
