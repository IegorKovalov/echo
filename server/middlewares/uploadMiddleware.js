const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { compressMedia } = require("../utils/media/mediaCompressor");

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
		cb(
			new Error("Not an image or video! Please upload only images or videos."),
			false
		);
	}
};

// Base upload configuration with increased size limit
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 200 * 1024 * 1024, // 200MB max per file (will be compressed if needed)
		files: 5, // up to 5 files
	},
	fileFilter: fileFilter,
});

// Create a middleware to compress files after multer processes them
const compressFiles = async (req, res, next) => {
	try {
		// If no files were uploaded, continue
		if (!req.files || req.files.length === 0) {
			return next();
		}

		// Process each file for compression
		for (let i = 0; i < req.files.length; i++) {
			const file = req.files[i];

			// Check if file size exceeds 100MB
			const stats = fs.statSync(file.path);
			if (stats.size > 100 * 1024 * 1024) {
				console.log(
					`Compressing file: ${file.originalname} (${Math.round(stats.size / (1024 * 1024))}MB)`
				);

				// Compress the file and get the new path
				const compressedFilePath = await compressMedia(
					file.path,
					file.mimetype
				);

				if (compressedFilePath !== file.path) {
					// Update the file path to the compressed version
					const originalPath = file.path;
					file.path = compressedFilePath;
					file.size = fs.statSync(compressedFilePath).size;

					// Delete the original file if it's different from the compressed one
					try {
						fs.unlinkSync(originalPath);
					} catch (err) {
						console.error("Error deleting original file:", err);
					}

					console.log(
						`Compressed to ${Math.round(file.size / (1024 * 1024))}MB`
					);
				}
			}
		}
		next();
	} catch (error) {
		console.error("Error in file compression middleware:", error);
		next(error);
	}
};

// Export both the original upload middleware and a version with compression
module.exports = {
	upload,
	uploadAndCompress: (fieldName, maxCount) => [
		upload.array(fieldName, maxCount),
		compressFiles,
	],
};
