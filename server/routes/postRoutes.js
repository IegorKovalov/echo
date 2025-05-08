const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const { uploadAndCompress } = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.use(authController.protect);

router.get("/trending", postController.getTrendingPosts);

router
	.route("/")
	.post(uploadAndCompress("media", 5), postController.createPost)
	.get(postController.getAllPosts);

router.get("/user/:userId", postController.getUserPosts);

router
	.route("/:id")
	.get(postController.getPost)
	.patch(uploadAndCompress("media", 5), postController.updatePost)
	.delete(postController.deletePost);

// View counter routes
router.patch("/:id/view", postController.incrementViews);
router.post("/batch-view", postController.batchIncrementViews); // New batch endpoint

router.post("/:id/renew", postController.renewPost);

router.post("/:id/comments", postController.addComment);

router.delete("/:id/comments/:commentId", postController.deleteComment);

module.exports = router;
