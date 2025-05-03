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
	onRenew,
}) {
	return (
		<div className="post-list">
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
					onRenew={onRenew}
				/>
			))}
		</div>
	);
}

export default PostList;
