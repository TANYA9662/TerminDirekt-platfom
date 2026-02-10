const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

export const absoluteUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

export const DEFAULT_COMPANY_IMAGE = absoluteUrl(
  "/uploads/companies/default.png"
);

export const DEFAULT_AVATAR = absoluteUrl(
  "/uploads/avatars/default.png"
);

export const mapCompanyImages = (images = []) => {
  if (!images.length) {
    return [{ url: DEFAULT_COMPANY_IMAGE, isDefault: true }];
  }

  return images.map(img => ({
    ...img,
    url: absoluteUrl(img.url), // ⬅️ SAMO url koji backend pošalje
    isDefault: false,
  }));
};

export const getUserAvatar = (user) =>
  absoluteUrl(user?.avatar) || DEFAULT_AVATAR;
