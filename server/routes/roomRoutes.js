const express = require("express");
const authController = require("../controllers/authController");
const roomController = require("../controllers/roomController");
const router = express.Router();

// All room routes require authentication
router.use(authController.protect);

// Room discovery routes
router.get("/discover", roomController.discoverRooms);
router.get("/official", roomController.getOfficialRooms);
router.get("/categories/:category", roomController.getRoomsByCategory);

// Room CRUD operations
router
	.route("/")
	.post(roomController.createRoom)
	.get(roomController.getUserRooms);

router
	.route("/:roomId")
	.get(roomController.getRoom)
	.patch(roomController.updateRoom)
	.delete(roomController.deleteRoom);

// Room interaction routes
router.post("/:roomId/join", roomController.joinRoom);
router.post("/:roomId/leave", roomController.leaveRoom);
router.get("/:roomId/members", roomController.getRoomMembers);

// Admin-only routes for user-created rooms
router.post("/:roomId/extend", roomController.extendRoomExpiration);
router.post("/:roomId/mute/:memberId", roomController.muteRoomMember);
router.post("/:roomId/unmute/:memberId", roomController.unmuteRoomMember);
router.post("/:roomId/kick/:memberId", roomController.kickRoomMember);

// Message routes
router.get("/:roomId/messages", roomController.getRoomMessages);
router.post("/:roomId/messages", roomController.createMessage);
router.patch("/:roomId/messages/:messageId", roomController.updateMessage);
router.delete("/:roomId/messages/:messageId", roomController.deleteMessage);
router.delete("/:roomId/messages/:messageId/admin", roomController.adminDeleteMessage);

// Message interaction routes
router.post("/:roomId/messages/:messageId/react", roomController.reactToMessage);
router.delete("/:roomId/messages/:messageId/react", roomController.removeReaction);
router.post("/:roomId/messages/:messageId/reply", roomController.replyToMessage);
router.post("/:roomId/messages/:messageId/read", roomController.markMessageAsRead);

module.exports = router; 