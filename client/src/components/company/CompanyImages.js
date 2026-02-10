import React, { useState } from "react";


const CompanyImages = ({ images, companyName }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 rounded-2xl bg-gray-200 flex items-center justify-center text-textLight shadow">
        Nema slika
      </div>
    );
  }

  const currentImage = images[carouselIndex];
  const imgSrc = getImageUrl(currentImage); // koristi Cloudinary URL

  const prevImage = () => {
    setCarouselIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCarouselIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md bg-gray-200">
      <img
        src={imgSrc}
        alt={companyName || `company-${carouselIndex}`}
        className="w-full h-full object-cover transition-transform duration-500"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default CompanyImages;
