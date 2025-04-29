import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";
import UserAvatar from "../common/UserAvatar";

function PostForm({ onPostCreated }) {
	const [postContent, setPostContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { currentUser } = useAuth();
	const { showToast } = useToast();

	const handleContentChange = (event) => {
		setPostContent(event.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!postContent.trim()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await PostService.createPost({ content: postContent });
			setPostContent("");
			if (onPostCreated && response.data && response.data.post) {
				onPostCreated(response.data.post);
			}
			showToast("Post created successfully!", "success");
		} catch (error) {
			showToast(
				error.response?.data?.message || "Failed to create post.",
				"error"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card.Body className="p-3">
			<div className="d-flex align-items-start mb-3">
				<div className="post-avatar">
					<UserAvatar fullName={currentUser?.fullName} variant="navbar" />
				</div>
				<Form className="w-100" onSubmit={handleSubmit}>
					<Form.Group>
						<Form.Control
							as="textarea"
							rows={3}
							value={postContent}
							onChange={handleContentChange}
							placeholder="What's on your mind?"
							className="post-input"
							disabled={isSubmitting}
						/>
					</Form.Group>
					<div className="d-flex justify-content-end mt-3">
						<Button
							variant="primary"
							type="submit"
							disabled={!postContent.trim() || isSubmitting}
							className="gradient-button"
						>
							{isSubmitting ? (
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
							) : (
								<FaPaperPlane className="me-2" />
							)}
							{isSubmitting ? "Posting..." : "Post"}
						</Button>
					</div>
				</Form>
			</div>
		</Card.Body>
	);
}

export default PostForm;
