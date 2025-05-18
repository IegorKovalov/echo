const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const roomController = require("./controllers/roomController");

dotenv.config({ path: "./.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB)
	.then(() => {
		console.log("DB connection successful!");
		
		roomController.ensureOfficialRooms()
			.then(() => console.log("Official rooms initialized!"))
			.catch(err => console.error("Error initializing official rooms:", err));
	})
	.catch((err) => {
		console.log("Error connecting to database:", err);
	});

const uploadDir = path.join(__dirname, "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}
const port = process.env.PORT || 8000;

cron.schedule("0 * * * *", async () => {
	console.log("Running scheduled cleanup of expired rooms...");
	await roomController.cleanupExpiredRooms();
});

cron.schedule("0 0 * * *", async () => {
	console.log("Running daily check of official rooms...");
	await roomController.ensureOfficialRooms();
});

const server = app.listen(port, () => {
	console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
});

process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
