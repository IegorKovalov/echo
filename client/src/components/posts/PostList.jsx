import React, { useContext } from "react";
import { useAuth } from "../../context/AuthContext";
import PostService from "../../services/post.service";

function PostList() {
	const { currentUser } = useAuth();
    
	return <div>PostList</div>;
}

export default PostList;
