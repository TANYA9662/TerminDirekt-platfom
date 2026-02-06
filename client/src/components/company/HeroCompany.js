import React from "react";

const HeroCompany = ({ company, onBookingClick }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-2xl shadow-md space-y-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-textDark">
        {company.name}
      </h1>

      {/* City / Adress */}
      <p className="text-gray-700 text-sm">
        {company.city} {company.address ? `• ${company.address}` : ""}
      </p>

      {/* description company */}
      <p className="text-textDark mt-2">
        {company.description || "Nema opisa."}
      </p>

      {/* button reservation */}
      <button
        onClick={onBookingClick}
        className="mt-4 w-full py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accentLight transition"
      >
        Zakaži termin
      </button>

      {/* Kontakt info */}
      <div className="mt-4 space-y-1 text-sm text-textDark">
        {company.email && (
          <p>
            <span className="font-medium">Email:</span> {company.email}
          </p>
        )}
        {company.phone && (
          <p>
            <span className="font-medium">Telefon:</span> {company.phone}
          </p>
        )}
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline block hover:text-accentLight"
          >
            Poseti sajt
          </a>
        )}
      </div>

      {/* Working time */}
      <div className="mt-3">
        <h3 className="font-semibold text-textDark">Radno vreme</h3>
        <p className="text-gray-700 mt-1">
          {company.opening_hours || "Nije definisano"}
        </p>
      </div>
    </div>
  );
};

export default HeroCompany;
