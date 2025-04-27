import React from "react";
import { Form } from "react-bootstrap";

function CommentSection({
	postComments,
	newCommentText,
	onNewCommentChange,
	submitComment,
}) {
	return (
		<div className="post-comments mt-3">
			{postComments.length > 0 && (
				<div>
					{postComments.map((comment) => (
						<p key={comment._id}>{comment.content}</p>
					))}
				</div>
			)}
			<>
				<Form.Control
					as="textarea"
					rows={1}
					value={newCommentText}
					onChange={onNewCommentChange}
					className="mb-2"
				/>
				<button className="btn btn-success btn-sm me-2" onClick={submitComment}>
					Post comment
				</button>
			</>
		</div>
	);
}

export default CommentSection;
