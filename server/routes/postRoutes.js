const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

router.use(authController.protect);

router
	.route("/")
	.post(postController.createPost)
	.get(postController.getAllPosts);

router.get("/user/:userId", postController.getUserPosts);

router
	.route("/:id")
	.get(postController.getPost)
	.patch(postController.updatePost)
	.delete(postController.deletePost);

router.post("/:id/renew", postController.renewPost);

router
	.route("/:id/like")
	.post(postController.likePost)
	.delete(postController.deleteLike);

router.post("/:id/comments", postController.addComment);

router.delete("/:id/comments/:commentId", postController.deleteComment);

module.exports = router;
