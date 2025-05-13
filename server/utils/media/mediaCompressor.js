const path = require("path");
const fs = require("fs").promises;
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);
const TARGET_SIZE = 100 * 1024 * 1024;
const compressImage = async (filePath, maxSize = TARGET_SIZE) => {
	try {
		const fileInfo = path.parse(filePath);
		const outputPath = path.join(
			fileInfo.dir,
			`${fileInfo.name}-compressed${fileInfo.ext}`
		);
		const metadata = await sharp(filePath).metadata();
		const fileStats = await fs.stat(filePath);
		if (fileStats.size <= maxSize) {
			await fs.copyFile(filePath, outputPath);
			return outputPath;
		}
		let quality = 80;
		if (fileStats.size > maxSize * 2) {
			quality = 60;
		} else if (fileStats.size > maxSize * 4) {
			quality = 40;
		}
		let width = metadata.width;
		let height = metadata.height;

		// If image is very large, resize it to reduce dimensions
		if (width > 2000 || height > 2000) {
			const aspectRatio = width / height;
			if (width > height) {
				width = Math.min(width, 2000);
				height = Math.round(width / aspectRatio);
			} else {
				height = Math.min(height, 2000);
				width = Math.round(height * aspectRatio);
			}
		}

		await sharp(filePath)
			.resize(width, height)
			.jpeg({ quality, progressive: true })
			.toFile(outputPath);

		return outputPath;
	} catch (error) {
		console.error("Error compressing image:", error);
		throw error;
	}
};

/**
 * Compress a video file to reduce its size
 * @param {string} filePath - Path to the video file
 * @param {number} maxSize - Max file size in bytes
 * @returns {Promise<string>} - Path to the compressed video
 */
const compressVideo = async (filePath, maxSize = TARGET_SIZE) => {
	try {
		const fileInfo = path.parse(filePath);
		const outputPath = path.join(
			fileInfo.dir,
			`${fileInfo.name}-compressed${fileInfo.ext}`
		);

		// If file is already smaller than target, just copy it
		const fileStats = await fs.stat(filePath);
		if (fileStats.size <= maxSize) {
			await fs.copyFile(filePath, outputPath);
			return outputPath;
		}

		// Calculate estimated bitrate based on target size
		// Assuming average video is ~2 minutes
		const estimatedDuration = 120; // 2 minutes in seconds
		const targetBitrate = Math.floor((maxSize * 8) / estimatedDuration);

		return new Promise((resolve, reject) => {
			ffmpeg(filePath)
				.outputOptions([
					`-b:v ${Math.min(800, targetBitrate / 1000)}k`, // Video bitrate
					"-crf 28", // Constant Rate Factor (quality)
					"-preset faster", // Encoding speed/compression
					"-c:v libx264", // Video codec
					"-c:a aac", // Audio codec
					"-b:a 128k", // Audio bitrate
				])
				.save(outputPath)
				.on("end", () => resolve(outputPath))
				.on("error", (err) => reject(err));
		});
	} catch (error) {
		console.error("Error compressing video:", error);
		throw error;
	}
};

/**
 * Compress a media file (image or video) if it exceeds the target size
 * @param {string} filePath - Path to the media file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Path to the compressed media file
 */
const compressMedia = async (filePath, mimeType) => {
	try {
		if (mimeType.startsWith("image/")) {
			return await compressImage(filePath);
		} else if (mimeType.startsWith("video/")) {
			return await compressVideo(filePath);
		} else {
			return filePath; // Return original if not image/video
		}
	} catch (error) {
		console.error("Error in media compression:", error);
		return filePath; // Return original on error
	}
};

module.exports = { compressImage, compressVideo, compressMedia }; 