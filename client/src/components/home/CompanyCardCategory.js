import React, { useState, useEffect } from "react";
import { absoluteUrl } from "../../utils/imageUtils";
import { useTranslation } from "react-i18next";
export const DEFAULT_COMPANY_IMAGE = absoluteUrl("/uploads/companies/default.png");

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

const CompanyCardCategory = ({ company, onBook }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [currentImage, setCurrentImage] = useState(0);

  const images = (company.images?.map(img => ({ ...img, url: absoluteUrl(img.url) })) || []);
  const imgUrl = images[currentImage]?.url || DEFAULT_COMPANY_IMAGE;

  useEffect(() => setCurrentImage(0), [company.id]);
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => setCurrentImage(prev => (prev + 1) % images.length), 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg bg-white ring-1 ring-gray-300">
      <img src={imgUrl} alt={getTranslated(company.name, lang)} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{getTranslated(company.name, lang)}</h3>
        <p className="text-gray-500">{company.city}</p>
        <div className="mt-1 flex items-center gap-2">
          <Stars rating={company.avg_rating} t={t} />
          {company.review_count > 0 && <span className="text-xs text-gray-400">({company.review_count})</span>}
        </div>
        <button
          onClick={() => onBook(company)}
          className="mt-2 py-2 w-full bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors duration-300"
        >
          {t("companyCard.book_button")}
        </button>
      </div>
    </div>
  );
};

export default CompanyCardCategory;
