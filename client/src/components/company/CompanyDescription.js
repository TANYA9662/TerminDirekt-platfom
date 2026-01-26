import React, { useState } from "react";
import API from "../../api";

const CompanyDescription = ({ companyId, onNext }) => {
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    try {
      await API.put(`/companies/${companyId}`, { description });
      onNext();
    } catch (err) {
      console.error(err);
      alert("Greška pri update opisa");
    }
  };

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-textDark">Opis firme</h2>

      <textarea
        className="w-full bg-white border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Unesite opis firme..."
        rows={5}
      />

      <button
        onClick={handleSubmit}
        className="bg-accent text-cardBg px-6 py-2 rounded-xl font-semibold hover:bg-accentLight transition"
      >
        Dalje
      </button>
    </div>
  );
};


export default CompanyDescription;
