import React from "react";
import { useTranslation } from "react-i18next";

const CompanyCarousel = ({
  images,
  currentImage,
  prevImage,
  nextImage,
  handleDeleteImage,
}) => {
  const { t } = useTranslation();

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-textLight rounded-2xl shadow">
        {t("company.no_images", "Nema slika")}
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 mb-4 overflow-hidden rounded-2xl shadow-md bg-gray-200">
      <img
        src={`http://localhost:3001${images[currentImage].image_path}`}
        alt={t("company.image_alt", `Slika ${currentImage + 1}`)}
        className="w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
            aria-label={t("company.prev_image", "Prethodna slika")}
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
            aria-label={t("company.next_image", "Sledeća slika")}
          >
            ›
          </button>
        </>
      )}

      <button
        onClick={handleDeleteImage}
        className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 transition"
      >
        {t("company.delete_image", "Obriši")}
      </button>
    </div>
  );
};

export default CompanyCarousel;
