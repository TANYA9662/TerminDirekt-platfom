import express from "express";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Upload slike za kompaniju
router.post("/company/:id", upload.array("images", 10), (req, res) => {
  if (!req.files) return res.status(400).json({ error: "Nema fajlova" });

  const files = req.files.map(f => ({
    filename: f.filename,
    url: f.path || f.secure_url, // Cloudinary vraća secure_url, lokalni path koristi path
  }));

  res.json({ images: files });
});

export default router;
