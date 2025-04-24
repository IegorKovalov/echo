import React, { useState } from "react";
import { Card, Dropdown } from "react-bootstrap";
import { FaComment, FaEllipsisV, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";

const PostItem = ({ post, onLike, onUnlike, onComment, onDelete, onEdit }) => {
	const { currentUser } = useAuth();
	const [showComments, setShowComments] = useState(false);
	const [isLiked, setIsLiked] = useState(false);

	const handleLikeClick = () => {
		if (isLiked) {
			setIsLiked(false);
			onUnlike(post._id);
		} else {
			setIsLiked(true);
			onLike(post._id);
		}
	};
	return (
		<Card className="post-card mb-3">
			<Card.Header className="post-header">
				<div className="d-flex align-items-center">
					<div className="post-avatar">
						<UserAvatar
							src={post.user.profilePicture}
							fullName={post.user.fullName}
							variant="post"
						/>
					</div>

					<div className="ms-2">
						<h6 className="mb-0">{post.user.fullName}</h6>
						<small className="text-secondary">@{post.user.username}</small>
					</div>
				</div>
				{post.user._id === currentUser?._id && (
					<Dropdown align="end">
						<Dropdown.Toggle variant="link" className="p-0 text-light">
							<FaEllipsisV />
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item onClick={() => onEdit(post._id)}>
								Edit
							</Dropdown.Item>
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
				<Card.Text>{post.content}</Card.Text>
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
						{/* Comment form will go here */}
					</div>
				)}
			</Card.Footer>
		</Card>
	);
};

export default PostItem;
