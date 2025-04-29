import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { FaClock, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";
import UserAvatar from "../common/UserAvatar";

function PostForm({ onPostCreated }) {
	const [postContent, setPostContent] = useState("");
	const [expirationTime, setExpirationTime] = useState("24");
	const [showExpirationOptions, setShowExpirationOptions] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { currentUser } = useAuth();
	const { showToast } = useToast();

	const handleContentChange = (event) => {
		setPostContent(event.target.value);
	};

	const handleExpirationChange = (event) => {
		setExpirationTime(event.target.value);
	};

	const toggleExpirationOptions = () => {
		setShowExpirationOptions(!showExpirationOptions);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!postContent.trim()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await PostService.createPost({
				content: postContent,
				expirationTime: expirationTime,
			});

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

	const expirationOptions = [
		{ value: "1", label: "1 hour" },
		{ value: "6", label: "6 hours" },
		{ value: "12", label: "12 hours" },
		{ value: "24", label: "24 hours" },
		{ value: "48", label: "2 days" },
		{ value: "72", label: "3 days" },
		{ value: "168", label: "1 week" },
	];

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

					{/* Expiration settings */}
					<div className="d-flex justify-content-between align-items-center mt-3">
						<Button
							variant="link"
							className="text-secondary p-0"
							onClick={toggleExpirationOptions}
						>
							<FaClock className="me-1" />
							Set expiration time
						</Button>

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

					{showExpirationOptions && (
						<div className="expiration-options mt-3 p-2 rounded">
							<Form.Label className="text-secondary mb-2">
								This post will expire after:
							</Form.Label>
							<Form.Select
								value={expirationTime}
								onChange={handleExpirationChange}
								className="expiration-select"
							>
								{expirationOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Form.Select>
							<small className="text-muted d-block mt-1">
								All posts automatically expire after the selected time. You can
								renew a post up to 3 times.
							</small>
						</div>
					)}
				</Form>
			</div>
		</Card.Body>
	);
}

export default PostForm;
