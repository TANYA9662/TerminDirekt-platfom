import React, { useState, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";

export default function CompanyStep() {
  const { currentStepIndex, steps } = useOutletContext();
  const { company, updateCompany } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [name, setName] = useState(company?.name || "");
  const [description, setDescription] = useState(company?.description || "");
  const [city, setCity] = useState(company?.city || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!name.trim() || !city.trim() || !description.trim()) {
      setError("Molimo popunite naziv, grad i opis.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updatedCompany = await updateCompany({ name, city, description });

      // update local state u CompanyContext, ako updateCompany ne radi automatski
      if (updatedCompany) {
        navigate(`/onboarding/${steps[currentStepIndex + 1]}`);
      } else {
        setError("Greška pri čuvanju podataka.");
      }
    } catch (err) {
      console.error("CompanyStep handleNext error:", err);
      setError("Greška pri čuvanju podataka.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-md space-y-6">
        <h3 className="text-2xl font-semibold text-gray-800">Informacije o kompaniji</h3>
        {error && <div className="text-red-600">{error}</div>}

        <input
          type="text"
          placeholder="Naziv kompanije"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl border ring-1 ring-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          disabled={loading}
        />

        <textarea
          placeholder="Opis kompanije"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl border ring-1 ring-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          disabled={loading}
          rows={4}
        />

        <input
          type="text"
          placeholder="Grad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-3 rounded-xl border ring-1 ring-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          disabled={loading}
        />

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-white font-semibold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
          >
            {loading ? "Čuvanje..." : "Dalje"}
          </button>
        </div>
      </div>
    </div>
  );
}
