import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";
import API from "../../api"; // za učitavanje kategorija

export default function ServicesStep() {
  const { currentStepIndex, steps } = useOutletContext();
  const { company, updateCompanyServices, setCompanyServices } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [services, setServices] = useState(() => { return Array.isArray(company?.services) ? [...company.services] : []; });
  const [categories, setCategories] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Loading category ----
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
      } catch (err) {
        console.error("Greška pri učitavanju kategorija:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // ---- Add servis with tempId and choosed category ----
  const handleAddService = () => {
    if (!newServiceName.trim() || !newServiceCategory) {
      alert("Unesite naziv i kategoriju usluge");
      return;
    }

    const price = newServicePrice ? Number(newServicePrice) : 0;
    const tempId = `temp-${Date.now()}`;

    setServices([
      ...services,
      { tempId, name: newServiceName.trim(), price, category_id: Number(newServiceCategory) }
    ]);
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceCategory("");
  };

  // ---- IChange service in list ----
  const handleChangeService = (idx, field, value) => {
    const updated = [...services];
    updated[idx][field] = field === "price" ? Number(value) : value;
    setServices(updated);
  };

  // ---- Clean service from list ----
  const handleRemoveService = (idx) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  // ---- Keep servise, update CompanyContext and navigation ----
  const handleNext = async () => {
    if (!services.length) {
      setError("Molimo dodajte bar jednu uslugu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = services.map(s => ({
        ...(s.id ? { id: s.id } : {}),
        tempId: s.tempId,
        name: s.name,
        price: Number(s.price),
        category_id: Number(s.category_id),
      }));

      const updatedServices = await updateCompanyServices(payload);

      // Update company context sa novim servisima
      setCompanyServices(updatedServices);

      // Sačekaj da se context update izvrši pa navigiraj
      navigate(`/onboarding/${steps[currentStepIndex + 1]}`);

    } catch (err) {
      console.error("Greška pri čuvanju usluga:", err);
      setError("Greška pri čuvanju usluga.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(`/onboarding/${steps[currentStepIndex - 1]}`);

  return (
    <div className="min-h-screen bg-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white p-6 rounded-3xl shadow-md space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Dodajte usluge</h3>
          {error && <div className="text-red-600">{error}</div>}

          {/* Lista services */}
          <ul className="space-y-2">
            {services.map((srv, idx) => (
              <li key={srv.id ?? srv.tempId ?? idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={srv.name}
                  onChange={(e) => handleChangeService(idx, "name", e.target.value)}
                  className="border bg-gray-100 px-3 py-2 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <input
                  type="number"
                  value={srv.price}
                  onChange={(e) => handleChangeService(idx, "price", e.target.value)}
                  className="border bg-gray-100 px-3 py-2 rounded-xl w-36 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  onClick={() => handleRemoveService(idx)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                >
                  Obriši
                </button>
              </li>
            ))}
          </ul>

          {/* Dodaj novu uslugu */}
          <div className="flex flex-wrap gap-2 items-center mt-4">
            <input
              type="text"
              placeholder="Naziv usluge"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="border bg-gray-100 px-3 py-2 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              type="number"
              placeholder="Cena (RSD)"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              className="border bg-gray-100 px-3 py-2 rounded-xl w-36 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <select
              value={newServiceCategory}
              onChange={(e) => setNewServiceCategory(e.target.value)}
              className="border bg-gray-100 px-3 py-2 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Izaberite kategoriju</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddService}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
            >
              Dodaj
            </button>
          </div>

          {/* Dugmad Back / Finish */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700 transition"}`}
            >
              Nazad
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
            >
              {loading ? "Čuvanje..." : "Završi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
