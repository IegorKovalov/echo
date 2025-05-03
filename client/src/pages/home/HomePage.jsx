import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { FaBell, FaComment, FaHeart, FaPlus } from "react-icons/fa";
import PostForm from "../../components/posts/PostForm";
import PostList from "../../components/posts/PostList";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";

const HomePage = () => {
	const { currentUser } = useAuth();
	const { showToast } = useToast();
	const [greeting, setGreeting] = useState("");
	const [posts, setPosts] = useState([]);
	const [postsLoading, setPostsLoading] = useState(true);

	useEffect(() => {
		const hour = new Date().getHours();
		let newGreeting = "";

		if (hour < 12) {
			newGreeting = "Good morning";
		} else if (hour < 18) {
			newGreeting = "Good afternoon";
		} else {
			newGreeting = "Good evening";
		}

		setGreeting(newGreeting);
	}, []);
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				setPostsLoading(true);
				const response = await PostService.getAllPosts();
				const sortedPosts = response.data.posts.sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);
				setPosts(sortedPosts);
			} catch (err) {
				showToast(
					err.response?.data?.message || "Failed to fetch posts.",
					"error"
				);
				setPosts([]);
			} finally {
				setPostsLoading(false);
			}
		};

		fetchPosts();
	}, [showToast]);

	const handlePostCreated = (newPost) => {
		setPosts([newPost, ...posts]);
	};

	const handleOnLike = async (postID) => {
		try {
			const response = await PostService.likePost(postID);
			setPosts((currentPosts) =>
				currentPosts.map((post) =>
					post._id === postID ? response.data.data.post : post
				)
			);
		} catch (err) {
			console.error("Like error:", err);
			showToast(err.response?.data.message || "Failed to like post.", "error");
		}
	};
	const handleOnUnlike = async (postID) => {
		try {
			const response = await PostService.unlikePost(postID);
			setPosts((currentPosts) =>
				currentPosts.map((post) =>
					post._id === postID ? response.data.data.post : post
				)
			);
		} catch (err) {
			console.error("Unlike error:", err);
			showToast(
				err.response?.data.message || "Failed to unlike post.",
				"error"
			);
		}
	};
	const handleOnComment = async (postID, commentContent) => {
		try {
			const response = await PostService.addComment(postID, {
				commentContent: commentContent,
			});
			setPosts(
				posts.map((post) => (post._id === postID ? response.data.post : post))
			);
			showToast("Comment added successfully", "success"); // Optional toast
			return response;
		} catch (err) {
			console.error("Add comment error:", err);
			showToast(
				err.response?.data?.message || "Failed to add comment.",
				"error"
			);
			throw err;
		}
	};
	const handleOnEdit = async (postID, updatedContent) => {
		try {
			const response = await PostService.editPost(postID, {
				content: updatedContent,
			});
			setPosts(
				posts.map((post) => (post._id === postID ? response.data.post : post))
			);
			showToast("Post updated successfully", "success");
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to update post",
				"error"
			);
		}
	};
	const handleOnDelete = async (postID) => {
		try {
			await PostService.deletePost(postID);
			setPosts(posts.filter((post) => post._id !== postID));
			showToast("Post deleted successfully", "success");
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to delete post",
				"error"
			);
		}
	};
	const handleDeleteComment = async (postID, commentId) => {
		try {
			await PostService.deleteComment(postID, commentId);
			setPosts(
				posts.map((post) => {
					if (post._id === postID) {
						return {
							...post,
							comments: post.comments.filter(
								(comment) => comment._id !== commentId
							),
						};
					}
					return post;
				})
			);
			showToast("Comment deleted successfully", "success");
		} catch (err) {
			console.error("Delete comment error:", err);
			showToast(
				err.response?.data?.message || "Failed to delete comment",
				"error"
			);
		}
	};

	const handleOnRenew = async (postID, hours = 24) => {
		console.log("Renew post requested on Home Page:", postID, hours);
	};

	return (
		<Container className="py-4">
			<Row className="mb-4">
				<Col lg={8}>
					<div>
						<h1 className="fw-bold text-primary mb-3">
							{greeting}, {currentUser?.fullName?.split(" ")[0] || "User"}!
						</h1>
						<p className="text-secondary">
							Welcome to your personalized home feed. Here's what's happening.
						</p>
					</div>
				</Col>
			</Row>

			<Row className="g-4">
				<Col lg={8}>
					{/* Create Post Section */}
					{currentUser && ( // Only show post form if logged in
						<Card className="shadow-sm border-0 rounded-4 mb-4">
							<Card.Body className="p-4">
								<div className="mb-3">
									<h5 className="fw-bold mb-1">Create Echo</h5>
									<small className="text-secondary">
										Share your thoughts, moments, and experiences.
									</small>
								</div>
								<PostForm onPostCreated={handlePostCreated} />
							</Card.Body>
						</Card>
					)}

					{/* Echoes Feed */}
					<Card className="shadow-sm border-0 rounded-4">
						<Card.Body className="p-4">
							<div className="mb-4">
								<h5 className="fw-bold mb-1">Recent Echoes</h5>
								<small className="text-secondary">
									Discover what's new from other users
								</small>
							</div>
							{postsLoading ? (
								<div className="text-center py-4">
									<div
										className="spinner-border spinner-border-sm text-primary"
										role="status"
									>
										<span className="visually-hidden">Loading echoes...</span>
									</div>
									<p className="text-secondary mt-2">Loading echoes...</p>
								</div>
							) : posts.length === 0 ? (
								<div className="text-center py-5 my-4">
									<div
										className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
										style={{ width: "80px", height: "80px" }}
									>
										<FaComment className="text-primary" size={32} />
									</div>
									<h3 className="fw-bold text-primary mb-3">No Echoes Yet</h3>
									<p className="text-secondary">
										Be the first to create an echo!
									</p>
								</div>
							) : (
								<PostList
									posts={posts}
									onLike={handleOnLike}
									onUnlike={handleOnUnlike}
									onComment={handleOnComment}
									onEdit={handleOnEdit}
									onDelete={handleOnDelete}
									onDeleteComment={handleDeleteComment}
									onRenew={handleOnRenew}
								/>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default HomePage;
