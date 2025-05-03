import React from "react";
import { Button, Form, InputGroup, ListGroup } from "react-bootstrap";
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
		<div className="mt-4">
			{postComments.length > 0 && (
				<div className="comment-list mb-4">
					{postComments.map((comment) => (
						<div key={comment._id} className="comment-item mb-3">
							<div className="d-flex justify-content-between align-items-start">
								<div className="comment-content">
									<div className="comment-author">
										<span className="fw-medium">{comment.user.fullName}</span>
										<span className="text-secondary ms-2 comment-handle">
											@{comment.user.username}
										</span>
									</div>
									<div className="comment-text mt-1">{comment.content}</div>
								</div>
								<div className="comment-meta d-flex align-items-center">
									<small className="text-muted me-2">
										{formatTimestamp(comment.createdAt)}
									</small>
									{currentUser && currentUser._id === comment.user?._id && (
										<Button
											variant="link"
											className="text-danger p-0 comment-delete-btn"
											onClick={() => deleteComment(comment._id)}
										>
											<FaTrash size={12} />
										</Button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			<div className="comment-form-container">
				<InputGroup>
					<Form.Control
						as="textarea"
						rows={1}
						value={newCommentText}
						onChange={onNewCommentChange}
						placeholder="Write a comment..."
						aria-label="Comment input"
						className="comment-input border-end-0"
					/>
					<Button
						variant="light"
						onClick={submitComment}
						disabled={!newCommentText.trim() || isSubmitting}
						className="comment-submit-btn"
					>
						{isSubmitting ? (
							<span
								className="spinner-border spinner-border-sm"
								role="status"
								aria-hidden="true"
							></span>
						) : (
							<FaPaperPlane className="text-primary" />
						)}
					</Button>
				</InputGroup>
			</div>
		</div>
	);
}

export default CommentSection;
