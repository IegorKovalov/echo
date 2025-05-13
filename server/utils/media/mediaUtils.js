const fs = require("fs");
const cloudinary = require("./cloudinary");

exports.cleanupTempFiles = (files) => {
  if (!files || !Array.isArray(files)) return;
  
  files.forEach(file => {
    try {
      const filePath = typeof file === 'string' ? file : file.path;
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Failed to clean up temp file:`, err);
    }
  });
};

exports.uploadMediaToCloudinary = async (files) => {
  const uploadedMedia = [];
  
  if (!files || files.length === 0) return uploadedMedia;
  
  for (const file of files) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
        folder: "posts",
      });
      
      uploadedMedia.push({
        url: result.secure_url,
        type: file.mimetype.startsWith("video/") ? "video" : "image",
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error(`Failed to upload media: ${error.message}`);
    } finally {
      // Clean up the temp file regardless of success/failure
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error(`Failed to clean up temp file ${file.path}:`, err);
      }
    }
  }
  
  return uploadedMedia;
};

exports.deleteMediaFromCloudinary = async (mediaItems) => {
  if (!mediaItems || mediaItems.length === 0) return;
  
  for (const item of mediaItems) {
    try {
      if (item.publicId) {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.type === "video" ? "video" : "image",
        });
      }
    } catch (err) {
      console.error("Error deleting Cloudinary media:", err);
    }
  }
};


exports.cleanupOldTempFiles = (directory = "tmp/uploads/", maxAgeHours = 24) => {
  try {
    if (!fs.existsSync(directory)) return;
    
    const files = fs.readdirSync(directory);
    const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
    
    files.forEach((file) => {
      const filePath = `${directory}${file}`;
      try {
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Error checking or removing old temp file ${filePath}:`, err);
      }
    });
  } catch (error) {
    console.error("Error during temporary files cleanup:", error);
  }
}; 