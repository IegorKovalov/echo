import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import PostService from "../../services/post.service";
import PostItem from "./PostItem";

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
	const handleOnLike = (postId) => {};
	const handleOnUnlike = (postId) => {};
	const handelOnComment = (postId) => {};
	const handelOnDelete = async (postId) => {
		try {
			await PostService.deletePost(postId);
		} catch (err) {
			showToast(err.response?.data?.message || "Failed to delete post.");
		}
	};
	const handelOnEdit = (postId) => {};
	return (
		<>
			{posts.map((post) => (
				<PostItem
					key={post.id}
					post={post}
					onLike={handleOnLike}
					onUnlike={handleOnUnlike}
					onComment={handelOnComment}
					onEdit={handelOnEdit}
					onDelete={handelOnDelete}
				/>
			))}
		</>
	);
}

export default PostList;
