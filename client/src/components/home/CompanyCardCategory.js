import React from "react";
import { absoluteUrl } from "../../utils/imageUtils";

/* ================= STARS COMPONENT ================= */
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

/* ================= COMPANY CARD CATEGORY ================= */
const CompanyCardCategory = ({ company, onBook }) => {
  const imgUrl = company.images?.[0]
    ? company.images[0].url
      ? company.images[0].url
      : absoluteUrl(company.images[0])
    : absoluteUrl("/uploads/companies/default.png"); // fallback default

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg bg-white ring-1 ring-gray-300">
      <img
        src={imgUrl}
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
          className="mt-2 py-2 w-full bg-gray-100 text-gray-700 font-semibold rounded
          hover:bg-gray-200 transition-colors duration-300"
        >
          Rezerviši
        </button>
      </div>
    </div>
  );
};

export default CompanyCardCategory;
