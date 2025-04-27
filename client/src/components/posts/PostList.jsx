import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";
import PostCard from "./PostCard";

function PostList() {
	const { showToast } = useToast();
	const [posts, setPosts] = useState([]);
	useEffect(() => {
		const fetchPostData = async () => {
			try {
				const response = await PostService.getAllPosts();
				setPosts(response.data.posts);
			} catch (err) {
				showToast(err.response?.data?.message || "Failed to fetch posts.");
			}
		};
		fetchPostData();
	}, []);

	const handleOnLike = async (postId) => {
		try {
			await PostService.likePost(postId);
		} catch (err) {
			showToast(err.response?.data.message || "Failed to like post.", "error");
		}
	};

	const handleOnUnlike = (postId) => {};
	const handleOnDelete = async (postId) => {
		try {
			await PostService.deletePost(postId);
			setPosts(posts.filter((post) => post._id !== postId));
			showToast("Post deleted successfully", "success");
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to delete post.",
				"error"
			);
		}
	};

	const handleOnEdit = async (postId, newContent) => {
		try {
			const post = posts.find((post) => post._id === postId);
			const updatedPost = { ...post, content: newContent };
			const response = await PostService.updatePost(postId, updatedPost);
			setPosts(
				posts.map((post) => (post._id === postId ? response.data.post : post))
			);
			showToast("Post updated successfully", "success");
		} catch (err) {
			showToast(
				err.response?.data?.message || "Failed to update post.",
				"error"
			);
		}
	};
	const handleDeleteComment = async (postId, commentId) => {
		try {
			await PostService.deleteComment(postId, commentId);
			setPosts(
				posts.map((post) => {
					if (post._id === postId) {
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
	const handleOnComment = async (postId, newComment) => {
		try {
			const response = await PostService.addComment(postId, {
				commentContent: newComment,
			});
			setPosts(
				posts.map((post) => (post._id === postId ? response.data.post : post))
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

	return (
		<>
			{posts.map((post) => (
				<PostCard
					key={post._id}
					post={post}
					onLike={handleOnLike}
					onUnlike={handleOnUnlike}
					onComment={handleOnComment}
					onEdit={handleOnEdit}
					onDelete={handleOnDelete}
					onDeleteComment={handleDeleteComment}
				/>
			))}
		</>
	);
}

export default PostList;
