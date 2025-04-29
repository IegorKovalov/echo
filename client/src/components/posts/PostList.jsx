import React from "react";
import PostCard from "./PostCard";

function PostList({
	posts,
	onLike,
	onUnlike,
	onComment,
	onEdit,
	onDelete,
	onDeleteComment,
}) {
	return (
		<>
			{posts.map((post) => (
				<PostCard
					key={post._id}
					post={post}
					onLike={onLike}
					onUnlike={onUnlike}
					onComment={onComment}
					onEdit={onEdit}
					onDelete={onDelete}
					onDeleteComment={onDeleteComment}
				/>
			))}
		</>
	);
}

export default PostList;
