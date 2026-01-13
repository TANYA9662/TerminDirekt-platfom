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
      await updateCompany({ name, city, description });
      navigate(`/onboarding/${steps[currentStepIndex + 1]}`);
    } catch (err) {
      console.error("CompanyStep handleNext error:", err);
      setError("Greška pri čuvanju podataka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 text-white p-6 flex flex-col justify-center max-w-md mx-auto space-y-4 rounded-lg">
      <h3 className="text-xl font-semibold">Informacije o kompaniji</h3>
      {error && <div className="text-red-600">{error}</div>}

      <input
        type="text"
        placeholder="Naziv kompanije"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-gray-400 rounded bg-gray-400 text-white focus:outline-none"
        disabled={loading}
      />
      <textarea
        placeholder="Opis kompanije"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border border-gray-400 rounded bg-gray-400 text-white focus:outline-none"
        disabled={loading}
        rows={4}
      />
      <input
        type="text"
        placeholder="Grad"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full p-2 border border-gray-400 rounded bg-gray-400 text-white focus:outline-none"
        disabled={loading}
      />

      <div className="flex justify-between mt-4">
        <div /> {/* Nema Back dugmeta na prvom step-u */}
        <button
          onClick={handleNext}
          disabled={loading}
          className={`px-4 py-2 rounded text-white transition ${loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {loading ? "Čuvanje..." : "Dalje"}
        </button>
      </div>
    </div>
  );
}
