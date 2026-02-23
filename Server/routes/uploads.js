import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { pool } from "../config/db.js";

const router = express.Router();

// ================== Multer Memory Storage ==================
const upload = multer({
  storage: multer.memoryStorage(), // buffer za Cloudinary
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB po fajlu
});

// ================== Helper funkcija za build URL (opciono) ==================
const buildImageUrl = (imgRow) => {
  return imgRow.image_path; // jer već čuvaš Cloudinary URL
};

// ================== Route ==================
router.post("/company/:id", upload.array("images", 10), async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (isNaN(companyId)) return res.status(400).json({ message: "Nevažeći ID firme" });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Nema fajlova za upload" });

    const saved = [];

    for (const file of req.files) {
      // Upload slike na Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "companies" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      // Snimi URL u bazu
      const r = await pool.query(
        'INSERT INTO company_images (company_id, image_path) VALUES ($1, $2) RETURNING *',
        [companyId, result.secure_url]
      );

      saved.push({
        ...r.rows[0],
        url: buildImageUrl(r.rows[0]),
      });
    }

    res.status(201).json({ images: saved });
  } catch (err) {
    console.error("uploadCompanyImages error:", err);
    res.status(500).json({ message: "Greška pri uploadu slika", error: err.message });
  }
});

export default router;