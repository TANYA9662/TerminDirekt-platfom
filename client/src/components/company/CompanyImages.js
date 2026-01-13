// src/components/company/CompanyImages.js
import React from "react";

const CompanyImages = ({ images, carouselIndex, prevImage, nextImage, companyName }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 rounded-lg bg-gray-200 flex items-center justify-center">
        <span>Nema slika</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg">
      <img
        src={images[carouselIndex]?.image_path ? `http://localhost:3001${images[carouselIndex].image_path}` : "/images/default.png"}
        alt={companyName}
        className="w-full h-full object-cover transition-transform duration-500"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default CompanyImages;
