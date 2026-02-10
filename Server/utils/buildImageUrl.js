export const buildImageUrl = (img) => {
  if (img?.public_id) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}`;
  }

  return "/uploads/companies/default.png";
};
