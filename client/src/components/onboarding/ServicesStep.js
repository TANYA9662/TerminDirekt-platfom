import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

export default function ServicesStep() {
  const { t } = useTranslation();
  const { company, updateCompanyServices, setCompany } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [services, setServices] = useState(() => Array.isArray(company?.services) ? [...company.services] : []);
  const [categories, setCategories] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Load categories ----
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

  // ---- Add new service ----
  const handleAddService = () => {
    if (!newServiceName.trim() || !newServiceCategory) {
      toast.error(t("onboarding.enterNameCategory"));
      return;
    }

    const price = newServicePrice ? Number(newServicePrice) : 0;
    const tempId = `temp-${Date.now()}`;

    setServices([...services, { tempId, name: newServiceName.trim(), price, category_id: Number(newServiceCategory) }]);
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceCategory("");
  };

  // ---- Edit service ----
  const handleChangeService = (idx, field, value) => {
    const updated = [...services];
    updated[idx][field] = field === "price" ? Number(value) : value;
    setServices(updated);
  };

  // ---- Remove service ----
  const handleRemoveService = (idx) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  // ---- Odredi sledeći onboarding step ----
  const getNextStep = () => {
    if (!company?.name?.trim() || !company?.description?.trim()) return "company";
    if (!Array.isArray(company.images) || company.images.length === 0) return "images";
    if (!Array.isArray(services) || services.length === 0) return "services";
    return null;
  };

  // ---- Save services and navigate ----
  const handleNext = async () => {
    if (!services.length) {
      toast.error(t("onboarding.emptyList"));
      return;
    }

    setLoading(true);

    try {
      const payload = services.map(s => ({
        ...(s.id ? { id: s.id } : {}),
        name: s.name,
        price: Number(s.price),
        category_id: Number(s.category_id),
      }));

      const updatedServices = await updateCompanyServices(payload);
      setCompany(prev => ({ ...prev, services: updatedServices }));

      const nextStep = getNextStep();
      if (nextStep) navigate(`/onboarding/${nextStep}`);
    } catch (err) {
      console.error("Greška pri čuvanju servisa:", err);
      toast.error(t("onboarding.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (!company?.images || company.images.length === 0) navigate("/onboarding/images");
    else navigate("/onboarding/images"); // prethodni logički step
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white p-6 rounded-3xl shadow-md space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">{t("onboarding.addServices")}</h3>

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
                  {t("companyDashboard.delete")}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2 items-center mt-4">
            <input
              type="text"
              placeholder={t("onboarding.serviceName")}
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="border bg-gray-100 px-3 py-2 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              type="number"
              placeholder={t("onboarding.servicePrice")}
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              className="border bg-gray-100 px-3 py-2 rounded-xl w-36 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <select
              value={newServiceCategory}
              onChange={(e) => setNewServiceCategory(e.target.value)}
              className="border bg-gray-100 px-3 py-2 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t("onboarding.chooseCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddService}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
            >
              {t("onboarding.add")}
            </button>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700 transition"}`}
            >
              {t("onboarding.back")}
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
            >
              {loading ? t("onboarding.saving") : t("onboarding.finish")}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
