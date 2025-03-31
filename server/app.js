const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(morgan("dev")); // Logging middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS

// Body parser middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Simple test route
app.get("/", (req, res) => {
	res.status(200).json({
		status: "success",
		message: "API is working correctly",
	});
});

module.exports = app;
