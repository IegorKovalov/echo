const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const followerRouter = require("./routes/followerRoutes");

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.status(200).json({
		status: "success",
		message: "API is working correctly",
	});
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/followers", followerRouter);

module.exports = app;
