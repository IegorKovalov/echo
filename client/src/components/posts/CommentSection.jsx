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
		<div className="mt-3">
			{postComments.length > 0 && (
				<ListGroup className="mb-3">
					{postComments.map((comment) => (
						<ListGroup.Item
							key={comment._id}
							className="d-flex justify-content-between align-items-start"
						>
							<div className="ms-1 me-auto">
								<div className="text-primary comment-username">
									{comment.user.fullName}
								</div>
								<div className="text-secondary comment-handle">
									@{comment.user.username}
								</div>
								<div className="comment-content">{comment.content}</div>
							</div>
							<div>
								<div className="d-flex align-items-center">
									<small className="text-muted">
										{formatTimestamp(comment.createdAt)}
									</small>
									{currentUser && currentUser._id === comment.user?._id && (
										<Button
											variant="link"
											size="sm"
											className="text-danger p-0 mt-1 comment-delete"
											onClick={() => deleteComment(comment._id)}
										>
											<FaTrash size={12} />
										</Button>
									)}
								</div>
							</div>
						</ListGroup.Item>
					))}
				</ListGroup>
			)}
			<InputGroup className="mb-3 comment-form">
				<Form.Control
					as="textarea"
					rows={2}
					value={newCommentText}
					onChange={onNewCommentChange}
					placeholder="Write a comment..."
					aria-label="Comment input"
					className="comment-input"
				/>
				<Button
					variant="primary"
					onClick={submitComment}
					disabled={!newCommentText.trim() || isSubmitting}
					className="comment-submit"
				>
					{isSubmitting ? (
						<span
							className="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
					) : (
						<FaPaperPlane />
					)}
				</Button>
			</InputGroup>
		</div>
	);
}

export default CommentSection;
