const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dtlzrpjgn';

export const buildImageUrl = (img) => {
  if (!img) return ''; // ili neki placeholder Cloudinary image ako želiš

  // Ako imamo Cloudinary public_id
  if (img.public_id) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}`;
  }

  // fallback na image_path iz baze (već secure_url)
  if (img.image_path) {
    return img.image_path;
  }

  // nema slike
  return '';
};