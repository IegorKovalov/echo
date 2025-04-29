import { useEffect, useState } from "react";
import { Card, Container, InputGroup } from "react-bootstrap";
import PostForm from "../../components/posts/PostForm";
import PostList from "../../components/posts/PostList";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";
import UserService from "../../services/user.service";

const UserProfilePage = () => {
	const { currentUser } = useAuth();
	const { showToast } = useToast();
	const { profileImage } = useProfile();
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

	if (userLoading) {
		return (
			<Container className="py-5 text-center text-white">
				<div className="spinner-border text-light" role="status">
					<span className="visually-hidden">Loading user profile...</span>
				</div>
			</Container>
		);
	}

	return (
		<Container className="py-5">
			<Card className="post-card mb-3">
				<PostForm
					onPostCreated={(newPost) => {
						setPosts([newPost, ...posts]);
					}}
				/>
			</Card>

			{postsLoading ? (
				<div className="text-center py-4">
					<div
						className="spinner-border spinner-border-sm text-primary"
						role="status"
					>
						<span className="visually-hidden">Loading posts...</span>
					</div>
					<p className="text-muted mt-2">Loading posts...</p>
				</div>
			) : posts.length === 0 ? (
				<div className="text-center py-5 my-5">
					<h3 className="gradient-text mb-3">No posts created yet</h3>
					<p className="text-secondary">Start by creating your first post.</p>
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
				/>
			)}
		</Container>
	);
};

export default UserProfilePage;
