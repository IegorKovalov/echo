import React, { useEffect, useState } from "react";
import { Badge, Card, Dropdown, Form } from "react-bootstrap";
import { FaComment, FaEllipsisH, FaHeart, FaRegHeart } from "react-icons/fa";
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
	const formatPostDate = (date) => {
		return new Date(date).toLocaleString("en-GB", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div
			className={`post-card mb-4 ${isNearExpiration ? "expiring-post" : ""}`}
		>
			<div className="post-header d-flex justify-content-between align-items-center p-3">
				<div className="d-flex align-items-center">
					<div className="post-avatar me-3">
						<UserAvatar fullName={post.user.fullName} variant="navbar" />
					</div>
					<div className="post-header-info">
						<h6 className="mb-0 fw-semibold">{post.user.fullName}</h6>
						<small className="text-secondary">@{post.user.username}</small>
					</div>
				</div>
				<div className="post-header-actions d-flex align-items-center">
					{post.expiresAt && !post.isExpired && (
						<div className="me-3">
							<CountdownTimer
								expiresAt={post.expiresAt}
								expirationProgress={post.expirationProgress}
								renewalCount={post.renewalCount || 0}
								onRenew={handleRenew}
								canRenew={
									post.user._id === currentUser?._id && post.renewalCount < 3
								}
							/>
						</div>
					)}
					{post.user._id === currentUser?._id && (
						<Dropdown align="end">
							<Dropdown.Toggle
								variant="link"
								className="p-0 text-dark post-menu-toggle"
							>
								<FaEllipsisH />
							</Dropdown.Toggle>
							<Dropdown.Menu className="shadow-sm border-0">
								<Dropdown.Item onClick={startEditing} className="post-edit-btn">
									Edit
								</Dropdown.Item>
								<Dropdown.Item onClick={handleRenew} className="post-renew-btn">
									Renew
								</Dropdown.Item>
								<Dropdown.Item
									onClick={() => onDelete(post._id)}
									className="text-danger post-delete-btn"
								>
									Delete
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					)}
				</div>
			</div>

			<div className="post-body p-3">
				{isEditing ? (
					<div className="post-edit-form">
						<Form.Control
							as="textarea"
							rows={3}
							value={editedContent}
							onChange={onEditedContentChange}
							className="mb-2 post-edit-input"
						/>
						<div className="d-flex justify-content-end">
							<button
								className="btn btn-sm me-2 post-edit-cancel"
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</button>
							<button
								className="btn btn-primary btn-sm post-edit-save"
								onClick={() => {
									onEdit(post._id, editedContent);
									setIsEditing(false);
								}}
							>
								Save
							</button>
						</div>
					</div>
				) : (
					<>
						<div className="post-content">{post.content}</div>
						<div className="post-date mt-2">
							<small className="text-secondary">
								{formatPostDate(post.createdAt)}
							</small>
						</div>
					</>
				)}
			</div>

			<div className="post-footer p-3 border-top">
				<div className="d-flex justify-content-between">
					<button
						className={`post-action-btn like-btn d-flex align-items-center ${
							isLiked ? "liked" : ""
						}`}
						onClick={toggleLike}
					>
						{isLiked ? (
							<FaHeart className="text-danger me-2" />
						) : (
							<FaRegHeart className="me-2" />
						)}
						<span>{post.likes}</span>
					</button>

					<button
						className="post-action-btn comment-btn d-flex align-items-center"
						onClick={() => setCommentsVisible(!commentsVisible)}
					>
						<FaComment className="me-2" />
						<span>{postComments.length}</span>
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
			</div>
		</div>
	);
};

export default PostCard;
