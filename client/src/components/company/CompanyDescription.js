import React, { useState } from "react";
import API from "../../api";

const CompanyDescription = ({ companyId, onNext }) => {
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      await API.put(
        `/companies/${companyId}`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onNext();
    } catch (err) {
      console.error(err);
      alert("Greška pri update opisa");
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Opis firme</h2>
      <textarea
        className="w-full border p-2 rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Unesite opis firme..."
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Dalje
      </button>
    </div>
  );
};

export default CompanyDescription;
