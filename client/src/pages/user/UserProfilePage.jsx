import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { FaClock, FaComment, FaHeart, FaUser } from "react-icons/fa";
import PostForm from "../../components/posts/PostForm";
import PostList from "../../components/posts/PostList";
import ProfileHeader from "../../components/user/profile/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";
import UserService from "../../services/user.service";

const UserProfilePage = () => {
	const { currentUser } = useAuth();
	const { showToast } = useToast();
	const [userData, setUserData] = useState(null);
	const [posts, setPosts] = useState([]);
	const [userLoading, setUserLoading] = useState(true);
	const [postsLoading, setPostsLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setUserLoading(true);
				const response = await UserService.getProfile();
				setUserData(response.data.user);
			} catch (error) {
				console.error("Error fetching user data:", error);
			} finally {
				setUserLoading(false);
			}
		};

		fetchUserData();
	}, []);

	useEffect(() => {
		const fetchUserPosts = async () => {
			try {
				setPostsLoading(true);
				const response = await PostService.getUserPosts(currentUser._id);
				setPosts(response.data.posts);
			} catch (err) {
				showToast(
					err.response?.data?.message || "Failed to fetch user posts.",
					"error"
				);
			} finally {
				setPostsLoading(false);
			}
		};

		fetchUserPosts();
	}, [showToast, currentUser._id]);

	const handleOnLike = async (postID, userID) => {
		const postIndex = posts.findIndex((p) => p._id === postID);
		if (postIndex === -1) return;
		const updatedPosts = [...posts];
		const originalPost = { ...updatedPosts[postIndex] };
		updatedPosts[postIndex] = {
			...updatedPosts[postIndex],
			likes: updatedPosts[postIndex].likes + 1,
			likedBy: [...(updatedPosts[postIndex].likedBy || []), userID],
		};
		setPosts(updatedPosts);
		try {
			const response = await PostService.likePost(postID);
			setPosts((currentPosts) =>
				currentPosts.map((post) =>
					post._id === postID ? response.data.data.post : post
				)
			);
		} catch (err) {
			setPosts((currentPosts) =>
				currentPosts.map((post) => (post._id === postID ? originalPost : post))
			);
			showToast(err.response?.data.message || "Failed to like post.", "error");
		}
	};

	const handleOnUnlike = async (postID, userID) => {
		const postIndex = posts.findIndex((p) => p._id === postID);
		if (postIndex === -1) return;
		const updatedPosts = [...posts];
		const originalPost = { ...updatedPosts[postIndex] };
		updatedPosts[postIndex] = {
			...updatedPosts[postIndex],
			likes: Math.max(0, updatedPosts[postIndex].likes - 1),
			likedBy: (updatedPosts[postIndex].likedBy || []).filter(
				(id) => id !== userID
			),
		};
		setPosts(updatedPosts);
		try {
			const response = await PostService.unlikePost(postID);
			setPosts((currentPosts) =>
				currentPosts.map((post) =>
					post._id === postID ? response.data.data.post : post
				)
			);
		} catch (err) {
			setPosts((currentPosts) =>
				currentPosts.map((post) => (post._id === postID ? originalPost : post))
			);
			showToast(
				err.response?.data.message || "Failed to unlike post.",
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
				err.response?.data?.message || "Failed to delete post.",
				"error"
			);
		}
	};

	const handleOnEdit = async (postID, newContent) => {
		try {
			const post = posts.find((post) => post._id === postID);
			const updatedPost = { ...post, content: newContent };
			const response = await PostService.updatePost(postID, updatedPost);
			setPosts(
				posts.map((post) => (post._id === postID ? response.data.post : post))
			);
			showToast("Post updated successfully", "success");
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to update post.",
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
			showToast(
				err.response?.data?.message || "Failed to delete comment",
				"error"
			);
		}
	};

	const handleOnComment = async (postID, newComment) => {
		try {
			const response = await PostService.addComment(postID, {
				commentContent: newComment,
			});
			setPosts(
				posts.map((post) => (post._id === postID ? response.data.post : post))
			);

			return response;
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to add comment.",
				"error"
			);
			throw err;
		}
	};

	const handleOnRenew = async (postID, hours = 24) => {
		try {
			const response = await PostService.renewPost(postID, hours);

			if (response.data && response.data.data && response.data.data.post) {
				setPosts(
					posts.map((post) =>
						post._id === postID ? response.data.data.post : post
					)
				);
				showToast("Post renewed successfully", "success");
			}
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to renew post.",
				"error"
			);
		}
	};

	const totalInteractions = posts.reduce((acc, post) => {
		return acc + (post.likes || 0) + (post.comments?.length || 0);
	}, 0);

	const activeEchoes = posts.filter((post) => {
		if (post.expiresAt) {
			return new Date(post.expiresAt) > new Date();
		}
		return true;
	}).length;

	const getTimeSinceLastEcho = () => {
		if (posts.length === 0) return "Never";

		const lastEcho = posts[0];
		const lastEchoDate = new Date(lastEcho.createdAt);
		const now = new Date();
		const diffInHours = Math.floor((now - lastEchoDate) / (1000 * 60 * 60));

		if (diffInHours < 1) return "Just now";
		if (diffInHours < 24) return `${diffInHours}h ago`;
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays}d ago`;
	};

	if (userLoading) {
		return (
			<Container className="py-5 text-center">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading user profile...</span>
				</div>
				<p className="mt-2 text-secondary">Loading profile...</p>
			</Container>
		);
	}

	return (
		<Container className="py-4 px-4">
			<Row className="justify-content-center">
				<Col lg={11} xl={9}>
					{/* Profile Overview */}
					<div className="profile-overview mb-4">
						<ProfileHeader user={userData} isCurrentUser={true} />
					</div>

					{/* Activity Overview */}
					<Row className="mb-4 g-3">
						<Col md={4}>
							<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
								<Card.Body className="p-3 p-md-4 text-center">
									<div
										className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3"
										style={{ width: "60px", height: "60px" }}
									>
										<FaUser className="text-primary" size={24} />
									</div>
									<h3 className="fw-bold mb-1">{activeEchoes}</h3>
									<p className="text-secondary mb-0">Active Echoes</p>
								</Card.Body>
							</Card>
						</Col>
						<Col md={4}>
							<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
								<Card.Body className="p-3 p-md-4 text-center">
									<div
										className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3"
										style={{ width: "60px", height: "60px" }}
									>
										<FaHeart className="text-primary" size={24} />
									</div>
									<h3 className="fw-bold mb-1">{totalInteractions}</h3>
									<p className="text-secondary mb-0">Total Engagement</p>
								</Card.Body>
							</Card>
						</Col>
						<Col md={4}>
							<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
								<Card.Body className="p-3 p-md-4 text-center">
									<div
										className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3"
										style={{ width: "60px", height: "60px" }}
									>
										<FaClock className="text-primary" size={24} />
									</div>
									<h3 className="fw-bold mb-1" data-type="time">
										{getTimeSinceLastEcho()}
									</h3>
									<p className="text-secondary mb-0">Recent Activity</p>
								</Card.Body>
							</Card>
						</Col>
					</Row>

					{/* Create Echo Section */}
					<Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4">
						<Card.Body className="p-4">
							<div className="mb-3">
								<h5 className="fw-bold mb-1">Create Echo</h5>
								<small className="text-secondary">
									Echoes automatically expire after 24 hours
								</small>
							</div>
							<PostForm
								onPostCreated={(newPost) => {
									setPosts([newPost, ...posts]);
								}}
							/>
						</Card.Body>
					</Card>

					{/* Echoes Feed */}
					<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
						<Card.Body className="p-4">
							<div className="mb-4">
								<h5 className="fw-bold mb-1">Your Echoes</h5>
								<small className="text-secondary">
									Recent and active echoes
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
									<h3 className="fw-bold text-primary mb-3">No Echoes</h3>
									<p className="text-secondary">
										Create your first echo to begin
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

export default UserProfilePage;
