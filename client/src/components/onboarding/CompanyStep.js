import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CompanyStep() {
  const { t } = useTranslation();
  const { company, updateCompany } = useContext(CompanyContext);
  const navigate = useNavigate();

  // Početne vrednosti iz context-a, tako da se čuvaju pri refreshu
  const [name, setName] = useState(company?.name || "");
  const [description, setDescription] = useState(company?.description || "");
  const [city, setCity] = useState(company?.city || "");
  const [loading, setLoading] = useState(false);

  // Ako se company u context-u promeni (npr. fetch), ažuriramo lokalni state
  useEffect(() => {
    setName(company?.name || "");
    setDescription(company?.description || "");
    setCity(company?.city || "");
  }, [company]);

  const handleNext = async () => {
    if (!name.trim() || !city.trim() || !description.trim()) {
      toast.error(t("onboarding.fill_all_fields"));
      return;
    }

    setLoading(true);

    try {
      await updateCompany({ name, city, description });
      navigate("/onboarding/images"); // sledeći onboarding step
    } catch (err) {
      console.error("CompanyStep handleNext error:", err);
      toast.error(t("onboarding.error_save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-14 rounded-3xl shadow-md w-full max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-md space-y-6">
        <h3 className="text-2xl font-semibold text-gray-800">{t("onboarding.company_info")}</h3>

        <input
          type="text"
          placeholder={t("onboarding.company_name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl border ring-1 ring-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          disabled={loading}
        />

        <textarea
          placeholder={t("onboarding.company_description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl border ring-1 ring-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          disabled={loading}
          rows={4}
        />

        <input
          type="text"
          placeholder={t("onboarding.city")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-3 rounded-xl border ring-1 ring-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          disabled={loading}
        />

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-white font-semibold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"
              }`}
          >
            {loading ? t("onboarding.saving") : t("onboarding.next")}
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
