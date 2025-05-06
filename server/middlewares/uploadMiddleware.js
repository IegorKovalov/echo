const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "tmp/uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype.startsWith("image/") ||
		file.mimetype.startsWith("video/")
	) {
		cb(null, true);
	} else {
		cb(new Error("Not an image or video! Please upload only images or videos."), false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB max per file
		files: 5, // up to 5 files
	},
	fileFilter: fileFilter,
});

module.exports = upload;
