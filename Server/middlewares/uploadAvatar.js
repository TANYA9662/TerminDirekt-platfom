import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    format: async () => "png",
    public_id: (req, file) => Date.now().toString(),
  },
});

const uploadAvatar = multer({ storage });

export default uploadAvatar;