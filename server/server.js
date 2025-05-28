const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");


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
	})
	.catch((err) => {
		console.log("Error connecting to database:", err);
	});

const uploadDir = path.join(__dirname, "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}
const port = process.env.PORT || 8000;

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
