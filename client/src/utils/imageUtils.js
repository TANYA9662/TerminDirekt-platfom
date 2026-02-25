// src/utils/imageUtils.js

const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dtlzrpjgn";

// ----- Build Cloudinary / Backend URL -----
export const buildImageUrl = (img) => {
  if (!img) return `${BACKEND_BASE_URL}/uploads/companies/default.png`;

  if (img.public_id) return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}`;
  if (img.image_path) return img.image_path;
  if (img.filename) return `${BACKEND_BASE_URL}/uploads/companies/${img.filename}`;

  return `${BACKEND_BASE_URL}/uploads/companies/default.png`;
};

// ----- Absolute URL helper -----
export const absoluteUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${normalizedPath}`;
};

// ----- Default images -----
export const DEFAULT_COMPANY_IMAGE = absoluteUrl("/uploads/companies/default.png");
export const DEFAULT_AVATAR = absoluteUrl("/uploads/avatars/default.png");

// ----- Map company images -----
export const mapCompanyImages = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [{ url: DEFAULT_COMPANY_IMAGE, isDefault: true }];
  }

  return images.map((img) => {
    let url = img.url || img.image_path || "";
    if (!url.startsWith("http")) url = buildImageUrl(img);

    return {
      ...img,
      url,
      isDefault: !img.url && !img.image_path,
    };
  });
};

// ----- User avatar -----
export const getUserAvatar = (user) => absoluteUrl(user?.avatar) || DEFAULT_AVATAR;