import React, { useEffect, useState } from "react";
import { Badge, Card, Dropdown, Form } from "react-bootstrap";
import { FaEllipsisV, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import CountdownTimer from "../common/CountdownTimer";
import UserAvatar from "../common/UserAvatar";
import CommentSection from "./CommentSection";

const PostCard = ({
	post,
	onLike,
	onUnlike,
	onComment,
	onDelete,
	onEdit,
	onDeleteComment,
	onRenew,
}) => {
	const { currentUser } = useAuth();

	const [commentsVisible, setCommentsVisible] = useState(false);
	const [postComments, setPostComments] = useState(post.comments);
	const [newCommentText, setNewCommentText] = useState("");
	const [isLiked, setIsLiked] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [editedContent, setEditedContent] = useState(post.content);

	useEffect(() => {
		setPostComments(post.comments);
		setIsLiked(post.likedBy?.includes(currentUser._id) || false);
	}, [post, currentUser]);

	const toggleLike = () => {
		if (isLiked) {
			onUnlike(post._id, currentUser._id);
		} else {
			onLike(post._id, currentUser._id);
		}
	};

	const startEditing = () => {
		setEditedContent(post.content);
		setIsEditing(true);
	};

	const onEditedContentChange = (e) => setEditedContent(e.target.value);

	const onNewCommentChange = (e) => setNewCommentText(e.target.value);

	const handleCommentDelete = (commentId) => {
		onDeleteComment(post._id, commentId);
	};

	const submitComment = async () => {
		if (!newCommentText.trim()) return;

		setIsSubmittingComment(true);
		try {
			const result = await onComment(post._id, newCommentText);
			setNewCommentText("");
			if (result && result.data && result.data.post) {
				setPostComments(result.data.post.comments);
			}
		} catch (error) {
			console.error("Submit comment error:", error);
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const handleRenew = () => {
		if (onRenew) {
			onRenew(post._id);
		}
	};

	const isNearExpiration = post.expirationProgress > 75;

	return (
		<Card
			className={`post-card mb-3 ${isNearExpiration ? "expiring-post" : ""}`}
		>
			<Card.Header className="d-flex justify-content-between align-items-center">
				<div className="d-flex align-items-center">
					<div className="post-avatar">
						<UserAvatar fullName={post.user.fullName} variant="navbar" />
					</div>
					<div className="post-header-info">
						<h6>{post.user.fullName}</h6>
						<small>@{post.user.username}</small>
					</div>
				</div>
				<div className="post-header-actions">
					{post.expiresAt && !post.isExpired && (
						<CountdownTimer
							expiresAt={post.expiresAt}
							expirationProgress={post.expirationProgress}
							renewalCount={post.renewalCount || 0}
							onRenew={handleRenew}
							canRenew={
								post.user._id === currentUser?._id && post.renewalCount < 3
							}
						/>
					)}
					{post.user._id === currentUser?._id && (
						<Dropdown align="start">
							<Dropdown.Toggle variant="link" className="p-0 text-black">
								<FaEllipsisV />
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item onClick={startEditing}>Edit</Dropdown.Item>
								<Dropdown.Item onClick={handleRenew}>Renew</Dropdown.Item>
								<Dropdown.Item
									onClick={() => onDelete(post._id)}
									className="text-danger"
								>
									Delete
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					)}
				</div>
			</Card.Header>

			<Card.Body>
				{isEditing ? (
					<>
						<Form.Control
							as="textarea"
							rows={3}
							value={editedContent}
							onChange={onEditedContentChange}
							className="mb-2"
						/>
						<div>
							<button
								className="btn btn-success btn-sm me-2"
								onClick={() => {
									onEdit(post._id, editedContent);
									setIsEditing(false);
								}}
							>
								Save
							</button>
							<button
								className="btn btn-secondary btn-sm"
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</button>
						</div>
					</>
				) : (
					<Card.Text>{post.content}</Card.Text>
				)}
				<small className="text-secondary d-block mt-2">
					{new Date(post.createdAt).toLocaleString("en-GB")}
				</small>
			</Card.Body>

			<Card.Footer className="post-footer">
				<div className="d-flex justify-content-between">
					<button
						className={`btn btn-link post-action-btn ${isLiked ? "liked" : ""}`}
						onClick={toggleLike}
					>
						{isLiked ? <FaHeart /> : <FaRegHeart />} {post.likes}
					</button>

					<button
						className="btn btn-link post-action-btn"
						onClick={() => setCommentsVisible(!commentsVisible)}
					>
						<Badge bg="secondary" className="mb-2">
							{postComments.length}{" "}
							{postComments.length === 1 ? "Comment" : "Comments"}
						</Badge>
					</button>
				</div>

				{commentsVisible && (
					<CommentSection
						postComments={postComments}
						newCommentText={newCommentText}
						onNewCommentChange={onNewCommentChange}
						submitComment={submitComment}
						deleteComment={handleCommentDelete}
						isSubmitting={isSubmittingComment}
					/>
				)}
			</Card.Footer>
		</Card>
	);
};

export default PostCard;
