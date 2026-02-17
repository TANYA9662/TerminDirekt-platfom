const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

export const absoluteUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // ako nema leading slash — dodaj ga
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE}${normalizedPath}`;
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

  return images.map(img => {
    let url = img.image_path || img.url || "";

    // ako je već full URL ili počinje sa /uploads, ne dodaj API_BASE ponovo
    if (!url.startsWith("http") && !url.startsWith("/uploads")) {
      url = `/uploads/companies/${url}`;
    }

    return {
      ...img,
      url: absoluteUrl(url),
      isDefault: false,
    };
  });
};


export const getUserAvatar = (user) =>
  absoluteUrl(user?.avatar) || DEFAULT_AVATAR;
