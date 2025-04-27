import React, { useState } from "react";
import { Card, Dropdown, Form } from "react-bootstrap";
import { FaComment, FaEllipsisV, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";

const PostItem = ({ post, onLike, onUnlike, onComment, onDelete, onEdit }) => {
	const { currentUser } = useAuth();
	const [showComments, setShowComments] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [isLiked, setIsLiked] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [newContent, setNewContent] = useState("");

	const handleLikeClick = () => {
		if (isLiked) {
			setIsLiked(false);
			onUnlike(post._id);
		} else {
			setIsLiked(true);
			onLike(post._id);
		}
	};
	const handleEditClick = () => {
		setNewContent(post.content);
		setIsEdit(true);
	};

	const handleNewContent = (e) => setNewContent(e.target.value);
	const handleNewComment = (e) => setNewComment(e.target.value);
	const handleCommentPost = async () => {
		await onComment(post._id, newComment);
	};
	return (
		<Card className="post-card mb-3">
			<Card.Header className="d-flex justify-content-between align-items-center">
				<div className="d-flex align-items-center">
					<div className="post-avatar">
						<UserAvatar fullName={post.user.fullName} variant="navbar" />
					</div>
					<div className="ms-1">
						<h6 className="mb-1">{post.user.fullName}</h6>
						<small className="text-secondary">@{post.user.username}</small>
					</div>
				</div>
				{post.user._id === currentUser?._id && (
					<Dropdown align="start">
						<Dropdown.Toggle variant="link" className="p-0 text-black">
							<FaEllipsisV />
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item onClick={handleEditClick}>Edit</Dropdown.Item>
							<Dropdown.Item
								onClick={() => onDelete(post._id)}
								className="text-danger"
							>
								Delete
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				)}
			</Card.Header>
			<Card.Body>
				{isEdit ? (
					<>
						<Form.Control
							as="textarea"
							rows={3}
							value={newContent}
							onChange={handleNewContent}
							className="mb-2"
						/>
						<div>
							<button
								className="btn btn-success btn-sm me-2"
								onClick={() => {
									onEdit(post._id, newContent);
									setIsEdit(false);
								}}
							>
								Save
							</button>
							<button
								className="btn btn-secondary btn-sm"
								onClick={() => setIsEdit(false)}
							>
								Cancel
							</button>
						</div>
					</>
				) : (
					<Card.Text>{post.content}</Card.Text>
				)}

				<small className="text-secondary d-block mt-2">
					{new Date(post.createdAt).toLocaleString()}
				</small>
			</Card.Body>
			<Card.Footer className="post-footer">
				<div className="d-flex justify-content-between">
					{/* Like button */}
					<button
						className={`btn btn-link post-action-btn ${isLiked ? "liked" : ""}`}
						onClick={handleLikeClick}
					>
						{isLiked ? <FaHeart /> : <FaRegHeart />} {post.likes}
					</button>

					{/* Comment button */}
					<button
						className="btn btn-link post-action-btn"
						onClick={() => setShowComments(!showComments)}
					>
						<FaComment /> {post.comments.length}
					</button>
				</div>

				{/* Expandable comments section */}
				{showComments && (
					<div className="post-comments mt-3">
						{/* Comment list will go here */}
						<>
							<Form.Control
								as="textarea"
								rows={1}
								value={newComment}
								onChange={handleNewComment}
								className="mb-2"
							/>
							<button
								className="btn btn-success btn-sm me-2"
								onClick={handleCommentPost}
							>
								Post comment
							</button>
						</>
					</div>
				)}
			</Card.Footer>
		</Card>
	);
};

export default PostItem;
