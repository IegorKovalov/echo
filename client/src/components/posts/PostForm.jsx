import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
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
		<div className="post-form-container bg-white p-3 mb-4 rounded-3 shadow-sm">
			<div className="d-flex align-items-start">
				<div className="post-avatar me-3">
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
							className="post-input border-0 bg-light rounded-3 p-3"
							disabled={isSubmitting}
						/>
					</Form.Group>

					<div className="d-flex justify-content-between align-items-center mt-3">
						<Button
							variant="link"
							className="text-secondary p-0 d-flex align-items-center"
							onClick={toggleExpirationOptions}
						>
							<FaClock className="me-2" />
							<span>Set expiration</span>
						</Button>

						<Button
							variant="primary"
							type="submit"
							disabled={!postContent.trim() || isSubmitting}
							className="post-submit-btn px-4 py-2 rounded-pill"
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
						<div className="expiration-options mt-3 p-3 rounded-3 bg-light">
							<Form.Label className="mb-2 fw-medium">
								This post will expire after:
							</Form.Label>
							<Form.Select
								value={expirationTime}
								onChange={handleExpirationChange}
								className="expiration-select rounded-pill"
							>
								{expirationOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Form.Select>
							<small className="text-muted d-block mt-2">
								All posts automatically expire after the selected time. You can
								renew a post up to 3 times.
							</small>
						</div>
					)}
				</Form>
			</div>
		</div>
	);
}

export default PostForm;
