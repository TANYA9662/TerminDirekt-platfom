import crypto from "crypto";
import nodemailer from "nodemailer";
import express from "express";
import dotenv from "dotenv";
import bcrypt from 'bcryptjs'; // bcryptjs radi na serverless
import { pool } from '../config/db.js';
import { registerUser, loginUser, updateUser } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import uploadAvatar from "../middlewares/uploadAvatar.js";

dotenv.config();
const router = express.Router();

// ================= REGISTER / LOGIN =================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ================= UPDATE PROFILE =================
router.put("/me", authenticateToken, updateUser);

// ================= CURRENT USER =================
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, avatar 
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri učitavanju korisnika" });
  }
});

// ================= AVATAR UPLOAD =================
router.put(
  "/avatar",
  authenticateToken,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Slika nije poslata" });

    await pool.query(
      "UPDATE users SET avatar=$1 WHERE id=$2",
      [req.file.filename, req.user.id]
    );

    res.json({ avatar: req.file.filename });
  }
);

// ================= EMAIL TRANSPORT =================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= RESET PASSWORD REQUEST =================
router.post("/reset-password-request", async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (!userResult.rows.length) return res.json({ message: "Ako email postoji, link je poslat." });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE email=$3",
      [token, expires, email]
    );

    // Koristi BACKEND_BASE_URL iz env
    const resetLink = `${process.env.BACKEND_BASE_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"TerminDirekt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset lozinke",
      html: `<a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Link za reset je poslat." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const r = await pool.query(
      "SELECT id, reset_token_expires FROM users WHERE reset_token=$1",
      [token]
    );

    if (!r.rows.length) return res.status(400).json({ message: "Neispravan token." });
    if (new Date(r.rows[0].reset_token_expires) < new Date()) return res.status(400).json({ message: "Token je istekao." });

    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2",
      [hash, r.rows[0].id]
    );

    res.json({ message: "Lozinka je promenjena." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

export default router;