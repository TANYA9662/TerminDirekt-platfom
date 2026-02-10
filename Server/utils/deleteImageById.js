import cloudinary from "../config/cloudinary.js";
import pool from "../db/pool.js";

export const deleteImageById = async (imageId) => {
  const id = Number(imageId);
  if (isNaN(id)) throw new Error("Nevažeći ID slike");

  const r = await pool.query(
    "SELECT cloudinary_public_id FROM company_images WHERE id = $1",
    [id]
  );

  if (!r.rows.length) throw new Error("Slika ne postoji");

  const { cloudinary_public_id } = r.rows[0];

  if (cloudinary_public_id) {
    const result = await cloudinary.uploader.destroy(cloudinary_public_id);
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("Ne mogu da obrišem sliku iz Cloudinary");
    }
  }

  await pool.query("DELETE FROM company_images WHERE id = $1", [id]);

  return true;
};
