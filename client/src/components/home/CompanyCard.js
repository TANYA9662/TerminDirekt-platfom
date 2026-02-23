import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mapCompanyImages } from "../../utils/imageUtils";
import { useTranslation } from "react-i18next";

const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.sr || field.en || field.sv || "";
  return "";
};

const Stars = ({ rating, t }) => {
  if (!rating) return <span className="text-sm text-gray-400">{t("companyCard.no_reviews")}</span>;
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

const CompanyCard = ({ company, onBook }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const companyName = getTranslated(company.name, lang);
  const images = mapCompanyImages(company.images || []);

  useEffect(() => setCurrentImage(0), [company.id]);
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => setCurrentImage(prev => (prev + 1) % images.length), 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToCompany = () => navigate(`/companies/${company.id}`);

  return (
    <div
      onClick={goToCompany}
      className="rounded-3xl flex flex-col bg-white ring-1 ring-gray-300 overflow-hidden shadow-md transition-transform duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-xl cursor-pointer relative"
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={images[currentImage]?.url}
          alt={companyName}
          className={`w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105 ${images[currentImage]?.isDefault ? "opacity-60" : ""}`}
        />
      </div>
      <div className="p-4 flex flex-col gap-2 bg-white">
        <h3 className="text-lg font-semibold truncate text-gray-700">{companyName}</h3>
        {company.city && <p className="text-gray-500 text-sm">{company.city}</p>}
        <div className="flex items-center gap-2">
          <Stars rating={company.avg_rating} t={t} />
          {company.review_count > 0 && <span className="text-xs text-gray-400">({company.review_count})</span>}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onBook(company); }}
          className="mt-2 py-2 w-full bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors duration-300"
        >
          {t("companyCard.book_button")}
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;