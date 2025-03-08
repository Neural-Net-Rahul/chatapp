import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath: string) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully on cloudinary");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return uploadResult;
  } catch (e) {
    console.log("Error while uploading on cloudinary: ", e);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
