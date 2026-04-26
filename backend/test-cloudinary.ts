import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const run = async () => {
  try {
    console.log("Testing Cloudinary upload with config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      hasKey: !!process.env.CLOUDINARY_API_KEY,
      hasSecret: !!process.env.CLOUDINARY_API_SECRET
    });
    
    // A tiny 1x1 pixel transparent PNG
    const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    
    const result = await cloudinary.uploader.upload(pixel, { folder: "test" });
    console.log("✅ Success! Uploaded to:", result.secure_url);
    
    // Cleanup
    await cloudinary.uploader.destroy(result.public_id);
    console.log("✅ Cleaned up test image.");
  } catch (err) {
    console.error("❌ Failed:", err);
  }
};

run();
