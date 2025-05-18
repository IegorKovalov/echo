const express = require("express");
const authController = require("../controllers/authController");
const roomController = require("../controllers/roomController");
const router = express.Router();

router.use(authController.protect);
router.use(authController.requireVerification);

router.post("/", roomController.createRoom);
router.get("/", roomController.getRooms);
router.get("/:roomId", roomController.getRoom);

router.post("/:roomId/join", roomController.joinRoom);
router.delete("/:roomId/leave", roomController.leaveRoom);

router.post("/:roomId/messages", roomController.sendMessage);
router.get("/:roomId/messages", roomController.getMessages);

module.exports = router;
