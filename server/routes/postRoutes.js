const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

router.use(authController.protect);

// Get trending posts route - placed before other routes for visibility
router.get("/trending", postController.getTrendingPosts);

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

// View counter route
router.patch("/:id/view", postController.incrementViews);

router.post("/:id/renew", postController.renewPost);

router.post("/:id/comments", postController.addComment);

router.delete("/:id/comments/:commentId", postController.deleteComment);

module.exports = router;
