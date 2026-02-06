export const getImageUrl = (img) => {
  if (!img || !img.image_path) return '/uploads/companies/default.png'; // fallback
  return `/uploads/companies/${img.image_path}`;
};

