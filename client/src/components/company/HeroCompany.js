// src/components/company/HeroCompany.js
import React from "react";

const HeroCompany = ({ company, onBookingClick }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-2">
      <h1 className="text-2xl font-bold">{company.name}</h1>
      <p className="text-sm text-gray-600">
        {company.city} {company.address ? `• ${company.address}` : ""}
      </p>
      <p className="text-gray-700 mt-2">{company.description || "Nema opisa."}</p>
      <button
        onClick={onBookingClick}
        className="mt-4  text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Zakaži termin
      </button>
      <div className="mt-4 space-y-1">
        {company.email && <p><span className="font-medium">Email:</span> {company.email}</p>}
        {company.phone && <p><span className="font-medium">Telefon:</span> {company.phone}</p>}
        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 underline block">
            Poseti sajt
          </a>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-semibold">Radno vreme</h3>
        <p className="text-sm mt-1">{company.opening_hours || "Nije definisano"}</p>
      </div>
    </div>
  );
};

export default HeroCompany;
