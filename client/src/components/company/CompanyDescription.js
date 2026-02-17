import React, { useState } from "react";
import API from "../../api";
import { useTranslation } from "react-i18next";

const CompanyDescription = ({ companyId, onNext }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert(t("company.enter_description", "Unesite opis firme"));
      return;
    }

    setLoading(true);
    try {
      await API.put(`/companies/${companyId}`, { description });
      onNext();
    } catch (err) {
      console.error(err);
      alert(t("company.error_update_description", "Greška pri update opisa"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-textDark">
        {t("company.description_title", "Opis firme")}
      </h2>

      <textarea
        className="w-full bg-white border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("company.description_placeholder", "Unesite opis firme...")}
        rows={5}
        disabled={loading}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`bg-accent text-cardBg px-6 py-2 rounded-xl font-semibold hover:bg-accentLight transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? t("company.saving", "Čuvanje...") : t("company.next", "Dalje")}
      </button>
    </div>
  );
};

export default CompanyDescription;
