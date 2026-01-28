import React, { useState, useEffect } from "react";
import { getImageUrl } from '../../utils/imageUtils';

const CompanyCard = ({ company, onBook }) => {
  const [currentImage, setCurrentImage] = useState(0);

  // Svaka firma sada ima URL-ove
  const safeImages =
    Array.isArray(company.images) && company.images.length > 0
      ? company.images.map(img => img.url)
      : ['/uploads/companies/default.png'];

  // Reset slideshow kad se promeni firma
  useEffect(() => setCurrentImage(0), [company.id]);

  // Preload slika
  useEffect(() => {
    safeImages.forEach(url => new Image().src = url);
  }, [safeImages]);

  // Slideshow interval
  useEffect(() => {
    if (safeImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % safeImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [safeImages.length]);

  return (
    <div className="rounded-3xl flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-lg">
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={safeImages[currentImage]}
          alt={company.name || "Company image"}
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = getImageUrl({ image_path: 'default.png' })}
        />
      </div>

      <div className="p-4 flex flex-col gap-2 bg-black/20 backdrop-blur-md rounded-b-2xl">
        <h3 className="text-lg font-semibold truncate text-white drop-shadow-md">
          {company.name}
        </h3>
        {company.city && <p className="text-white/80 text-sm">{company.city}</p>}

        <button
          onClick={() => onBook(company)}
          className="mt-2 py-2 w-full bg-white/5 text-white font-bold rounded hover:bg-white/30 transition"
        >
          Rezerviši
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
