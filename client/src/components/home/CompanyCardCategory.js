import React from "react";
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

const CompanyCardCategory = ({ company, onBook }) => {
  return (
    <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
      <img
        src={company.images?.[0]?.url || getImageUrl({ image_path: "default.png" })}
        alt={company.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="font-bold text-lg">{company.name}</h3>
        <p className="text-gray-500">{company.city}</p>
        <div className="mt-1 flex items-center gap-2">
          <Stars rating={company.avg_rating} />
          {company.review_count > 0 && (
            <span className="text-xs text-gray-400">
              ({company.review_count})
            </span>
          )}
        </div>
        <button
          onClick={() => onBook(company)}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700"
        >
          Rezerviši
        </button>
      </div>
    </div>
  );
};

export default CompanyCardCategory;
