import React from "react";
import { Button, Form, InputGroup, ListGroup } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";

function CommentSection({
	postComments,
	newCommentText,
	onNewCommentChange,
	submitComment,
}) {
	return (
		<div className="mt-3">
			{postComments.length > 0 && (
				<ListGroup className="mb-3">
					{postComments.map((comment) => (
						<ListGroup.Item
							key={comment._id}
							className="d-flex justify-content-between align-items-start"
						>
							<div className="ms-2 me-auto">
								<div className="fw-bold">@{comment.user.username}</div>
								{comment.content}
							</div>
							<small className="text-muted">
								{new Date(comment.createdAt).toLocaleTimeString()}
							</small>
						</ListGroup.Item>
					))}
				</ListGroup>
			)}
			<InputGroup className="mb-3">
				<Form.Control
					as="textarea"
					rows={2}
					value={newCommentText}
					onChange={onNewCommentChange}
					placeholder="Write a comment..."
					aria-label="Comment input"
				/>
				<Button
					variant="outline-success"
					onClick={submitComment}
					disabled={!newCommentText.trim()}
				>
					<FaPaperPlane />
				</Button>
			</InputGroup>
		</div>
	);
}

export default CommentSection;
