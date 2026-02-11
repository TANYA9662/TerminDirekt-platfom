export const buildImageUrl = (img) => {
  // Ako slika ima Cloudinary public_id, koristi Cloudinary URL
  if (img?.public_id) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}`;
  }

  // Ako postoji lokalna filename, koristi lokalni upload path
  if (img?.filename) {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || "https://termindirekt-backend.onrender.com"
        : `http://localhost:${process.env.PORT || 3001}`;

    return `${baseUrl}/uploads/companies/${img.filename}`;
  }

  // Ako ništa od gore navedenog ne postoji, vrati default sliku
  return "/uploads/companies/default.png";
};
