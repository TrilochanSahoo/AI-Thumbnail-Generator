import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});



export async function uploadBase64ToCloudinary(base64: string, folder: string) {
  const res = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
  });

  return {
    url: res.secure_url,   // ✅ permanent https url
    publicId: res.public_id,
  }
}