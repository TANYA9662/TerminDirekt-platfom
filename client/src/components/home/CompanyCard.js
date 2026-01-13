import React from "react";
import Card from "../ui/Card";

const CompanyCard = ({ company, onBook }) => {
  return (
    <Card className="animate-fadeInUp p-4">
      <img
        src={company.images?.[0]?.image_path ? `http://localhost:3001${company.images[0].image_path}` : "/images/default.png"}
        alt={company.name}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <h3 className="text-lg font-semibold">{company.name}</h3>
      <p className="text-gray-500">{company.city}</p>
      <button
        onClick={() => onBook(company)}
        className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Zakaži termin
      </button>
    </Card>
  );
};

export default CompanyCard;
