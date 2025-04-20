const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

router.use(authController.protect);

router
	.route("/")
	.post(postController.createPost)
	.get(postController.getAllPosts);

router
	.route("/:id")
	.get(postController.getPost)
	.patch(postController.updatePost)
	.delete(postController.deletePost);

router
	.route("/:id/like")
	.post(postController.likePost)
	.delete(postController.deleteLike);

router.post("/:id/comments", postController.addComment);

router.delete("/:id/comments/:commentId", postController.deleteComment);
