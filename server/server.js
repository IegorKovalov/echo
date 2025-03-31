const app = require("./app");

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
	console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
