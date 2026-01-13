import React from "react";

const CompanyCarousel = ({ images, currentImage, prevImage, nextImage, handleDeleteImage }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-md h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
        Nema slika
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md h-64 mb-2 overflow-hidden rounded-lg shadow-lg">
      <img
        src={`http://localhost:3001${images[currentImage].image_path}`}
        alt={`Slika ${currentImage + 1}`}
        className="w-full h-full object-cover transition-opacity duration-700"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
          >
            ›
          </button>
        </>
      )}
      <button
        onClick={handleDeleteImage}
        className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Obriši
      </button>
    </div>
  );
};

export default CompanyCarousel;
