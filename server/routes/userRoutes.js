const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// Protected routes - require authentication
router.use(authController.protect);

router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);

module.exports = router;
