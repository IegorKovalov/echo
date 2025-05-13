const express = require("express");
const authController = require("../controllers/authController");
const followerController = require("../controllers/followerController");

const router = express.Router();

router.use(authController.protect);
router.use(authController.requireVerification);

router.get("/feed", followerController.getFollowingFeed);
router.get("/:userId/stats", followerController.getFollowerStats);
router.get("/:userId", followerController.getFollowers);
router.get("/:userId/following", followerController.getFollowing);
router.post("/:userId", followerController.followUser);
router.delete("/:userId", followerController.unfollowUser);

module.exports = router;
