import React from "react";

const CompanyCarousel = ({
  images,
  currentImage,
  prevImage,
  nextImage,
  handleDeleteImage,
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-textLight rounded-2xl shadow">
        Nema slika
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 mb-4 overflow-hidden rounded-2xl shadow-md bg-gray-200">
      <img
        src={`http://localhost:3001${images[currentImage].image_path}`}
        alt={`Slika ${currentImage + 1}`}
        className="w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
          >
            ›
          </button>
        </>
      )}

      <button
        onClick={handleDeleteImage}
        className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 transition"
      >
        Obriši
      </button>
    </div>
  );
};


export default CompanyCarousel;
