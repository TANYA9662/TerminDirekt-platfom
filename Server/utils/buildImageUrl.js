export const buildImageUrl = (img) => {
  if (!img) return "/uploads/companies/default.png";

  // Cloudinary URL ako postoji
  if (img.public_id) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}`;
  }

  // Lokalna slika
  if (img.image_path || img.filename) {
    const fileName = img.image_path || img.filename;
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || process.env.REACT_APP_API_URL
        : `http://localhost:${process.env.PORT || 3001}`;

    return `${baseUrl}/uploads/companies/${fileName}`;
  }

  // Default fallback
  return "/uploads/companies/default.png";
};
