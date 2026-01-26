import React, { useState, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";

export default function ServicesStep() {
  const { currentStepIndex, steps } = useOutletContext();
  const { company, updateCompanyServices } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [services, setServices] = useState(Array.isArray(company?.services) ? company.services : []);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddService = () => {
    if (!newServiceName.trim()) {
      alert("Unesite naziv usluge");
      return;
    }

    const price = newServicePrice ? Number(newServicePrice) : 0;
    setServices([...services, { name: newServiceName, price }]);
    setNewServiceName("");
    setNewServicePrice("");
  };

  const handleRemoveService = (idx) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const handleChangeService = (idx, field, value) => {
    const updated = [...services];
    updated[idx][field] = field === "price" ? Number(value) : value;
    setServices(updated);
  };

  const handleNext = async () => {
    if (!services || services.length === 0) {
      setError("Molimo dodajte bar jednu uslugu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateCompanyServices(company.id, services);
      navigate("/company-dashboard");
    } catch (err) {
      console.error(err);
      setError("Greška pri čuvanju usluga.");
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => navigate(`/onboarding/${steps[currentStepIndex - 1]}`);

  return (
    <div className="min-h-screen bg-gray-200 p-6 flex flex-col justify-center max-w-md mx-auto space-y-4 rounded-2xl shadow">
      <h3 className="text-xl font-semibold text-gray-800">Dodajte usluge</h3>
      {error && <div className="text-red-600">{error}</div>}

      {/* Lista postojećih usluga */}
      <ul className="space-y-2">
        {services.map((srv, idx) => (
          <li key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              value={srv.name}
              onChange={(e) => handleChangeService(idx, "name", e.target.value)}
              className="border bg-gray-100 px-2 py-1 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              type="number"
              value={srv.price}
              onChange={(e) => handleChangeService(idx, "price", e.target.value)}
              className="border bg-gray-100 px-2 py-1 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              onClick={() => handleRemoveService(idx)}
              className="bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition"
            >
              Obriši
            </button>
          </li>
        ))}
      </ul>

      {/* Dodavanje nove usluge */}
      <div className="flex gap-2 items-center mt-2">
        <input
          type="text"
          placeholder="Naziv usluge"
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
          className="border bg-gray-100 px-2 py-1 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <input
          type="number"
          placeholder="Cena (RSD)"
          value={newServicePrice}
          onChange={(e) => setNewServicePrice(e.target.value)}
          className="border bg-gray-100 px-2 py-1 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          onClick={handleAddService}
          disabled={loading}
          className={`px-3 py-1 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
        >
          Dodaj
        </button>
      </div>

      {/* Dugmad Nazad / Završi */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
        >
          Nazad
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
        >
          {loading ? "Čuvanje..." : "Završi"}
        </button>
      </div>
    </div>
  );
}
