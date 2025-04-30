import React from "react";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function CommentSection({
	postComments,
	newCommentText,
	onNewCommentChange,
	submitComment,
	deleteComment,
	isSubmitting,
}) {
	const { currentUser } = useAuth();

	const formatTimestamp = (createdAt) => {
		const commentDate = new Date(createdAt);
		const now = new Date();
		const secondsAgo = Math.floor((now - commentDate) / 1000);

		if (secondsAgo < 5) {
			return "just now";
		} else if (secondsAgo < 60) {
			return `${secondsAgo} sec ago`;
		} else if (secondsAgo < 3600) {
			const mins = Math.floor(secondsAgo / 60);
			return `${mins} min${mins > 1 ? "s" : ""} ago`;
		} else if (secondsAgo < 86400) {
			const hours = Math.floor(secondsAgo / 3600);
			return `${hours} hour${hours > 1 ? "s" : ""} ago`;
		} else {
			return commentDate.toLocaleDateString("en-GB");
		}
	};

	return (
		<div className="comment-section">
			{postComments.length > 0 && (
				<div>
					{postComments.map((comment) => (
						<div className="comment-item" key={comment._id}>
							<div className="comment-header">
								<span className="comment-username">{comment.user.fullName}</span>
								<span className="comment-handle">@{comment.user.username}</span>
								<span className="comment-timestamp">{formatTimestamp(comment.createdAt)}</span>
							</div>
							<div className="comment-content">{comment.content}</div>
							<div className="comment-actions">
								{currentUser && currentUser._id === comment.user?._id && (
									<button
										type="button"
										className="comment-delete"
										onClick={() => deleteComment(comment._id)}
										title="Delete comment"
									>
										<FaTrash size={14} />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
			<form className="comment-form" onSubmit={e => { e.preventDefault(); submitComment(); }}>
				<textarea
					className="comment-input"
					rows={2}
					value={newCommentText}
					onChange={onNewCommentChange}
					placeholder="Write a comment..."
					aria-label="Comment input"
					disabled={isSubmitting}
				/>
				<button
					type="submit"
					className="comment-submit"
					disabled={!newCommentText.trim() || isSubmitting}
					title="Post comment"
				>
					{isSubmitting ? (
						<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
					) : (
						<FaPaperPlane />
					)}
				</button>
			</form>
		</div>
	);
}

export default CommentSection;
