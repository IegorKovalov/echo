require("dotenv").config();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/userModel");
const Post = require("./models/postModel");
const Follower = require("./models/followerModel");

dotenv.config({ path: "./.env" });

const connectDB = async () => {
	try {
		const DB = process.env.DATABASE.replace(
			"<PASSWORD>",
			process.env.DATABASE_PASSWORD
		);
		await mongoose.connect(DB);
		console.log("MongoDB connected successfully!");
	} catch (err) {
		console.error("Failed to connect to MongoDB", err);
		process.exit(1);
	}
};

const clearDatabase = async () => {
	try {
		await User.deleteMany({});
		await Post.deleteMany({});
		await Follower.deleteMany({});
		console.log("Database cleared!");
	} catch (err) {
		console.error("Error clearing database:", err);
		process.exit(1);
	}
};

const createAdminUser = async () => {
	try {
		const adminUser = await User.create({
			username: "admin",
			email: "admin@example.com",
			password: "admin123",
			passwordConfirm: "admin123",
			fullName: "Admin User",
			isVerified: true,
			bio: "System administrator",
		});

		console.log("Admin user created successfully!");
		console.log(`Admin username: ${adminUser.username}`);
		console.log(`Admin email: ${adminUser.email}`);
		console.log(`Admin password: adminPassword123`);
	} catch (err) {
		console.error("Error creating admin user:", err);
		process.exit(1);
	}
};

const cleanDatabase = async () => {
	try {
		await connectDB();
		await clearDatabase();
		await createAdminUser();
	} catch (err) {
		console.error("Error cleaning database:", err);
		process.exit(1);
	} finally {
		await mongoose.connection.close();
		console.log("MongoDB connection closed.");
		process.exit(0);
	}
};

cleanDatabase();

module.exports = cleanDatabase;
