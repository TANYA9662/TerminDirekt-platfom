import React from "react";
import { useTranslation } from "react-i18next";

const HeroCompany = ({ company, onBookingClick }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-100 p-6 rounded-2xl shadow-md space-y-4">

      {/* Title */}
      <h1 className="text-3xl font-bold text-textDark">
        {company.name}
      </h1>

      {/* City / Address */}
      <p className="text-gray-700 text-sm">
        {company.city} {company.address ? `• ${company.address}` : ""}
      </p>

      {/* Description */}
      <p className="text-textDark mt-2">
        {company.description || t("home.no_companies")}
      </p>

      {/* Booking button */}
      <button
        onClick={onBookingClick}
        className="mt-4 w-full py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accentLight transition"
      >
        {t("categories.book_now")}
      </button>

      {/* Contact info */}
      <div className="mt-4 space-y-1 text-sm text-textDark">
        {company.email && (
          <p>
            <span className="font-medium">{t("contact.email")}:</span> {company.email}
          </p>
        )}
        {company.phone && (
          <p>
            <span className="font-medium">{t("contact.phone")}:</span> {company.phone}
          </p>
        )}
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline block hover:text-accentLight"
          >
            {t("contact.website")}
          </a>
        )}
      </div>

      {/* Working hours */}
      <div className="mt-3">
        <h3 className="font-semibold text-textDark">{t("company.working_hours")}</h3>
        <p className="text-gray-700 mt-1">
          {company.opening_hours || t("company.not_defined")}
        </p>
      </div>

    </div>
  );
};

export default HeroCompany;
