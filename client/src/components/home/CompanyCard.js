import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";

/* ================= STARS KOMPONENTA ================= */
const Stars = ({ rating }) => {
  if (!rating) {
    return <span className="text-sm text-gray-400">Bez recenzija</span>;
  }

  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1 text-yellow-400 text-sm">
      {[...Array(5)].map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i} className="text-gray-300">★</span>;
      })}
    </div>
  );
};

/* ================= COMPANY CARD ================= */
const CompanyCard = ({ company, onBook }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  const safeImages =
    Array.isArray(company.images) && company.images.length > 0
      ? company.images.map(img => img.url)
      : [getImageUrl({ image_path: "default.png" })];

  useEffect(() => setCurrentImage(0), [company.id]);

  useEffect(() => {
    safeImages.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [safeImages]);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % safeImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [safeImages.length]);

  const goToCompany = () => {
    navigate(`/companies/${company.id}`);
  };

  return (
    <div
      onClick={goToCompany}
      className="rounded-3xl flex flex-col overflow-hidden
                 bg-white shadow-md
                 transition-transform duration-500 ease-in-out
                 transform hover:-translate-y-2 hover:shadow-xl cursor-pointer relative"
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={safeImages[currentImage]}
          alt={company.name || "Company image"}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
          onError={(e) =>
            (e.target.src = getImageUrl({ image_path: "default.png" }))
          }
        />

        <div className="absolute bottom-0 left-0 w-full h-1
                        bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300
                        opacity-0 rounded-t-full
                        transition-opacity duration-500 ease-in-out
                        hover:opacity-100" />
      </div>

      <div className="p-4 flex flex-col gap-2 bg-white">
        <h3 className="text-lg font-semibold truncate text-gray-700">
          {company.name}
        </h3>

        {company.city && (
          <p className="text-gray-500 text-sm">{company.city}</p>
        )}

        {/* ⭐ ZVEZDICE */}
        <div className="flex items-center gap-2">
          <Stars rating={company.avg_rating} />
          {company.review_count > 0 && (
            <span className="text-xs text-gray-400">
              ({company.review_count})
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook(company);
          }}
          className="mt-2 py-2 w-full bg-gray-100 text-gray-700 font-semibold rounded
                     hover:bg-gray-200 transition-colors duration-300"
        >
          Rezerviši
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
