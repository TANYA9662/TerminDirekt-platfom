import React, { useContext, useEffect, useState } from "react";
import { CompanyContext } from "../../context/CompanyContext";
import { useTranslation } from "react-i18next";

const CompanyInfo = () => {
  const { t } = useTranslation();
  const { company, updateCompany } = useContext(CompanyContext);
  const [form, setForm] = useState({
    name: "",
    city: "",
    description: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        city: company.city || "",
        description: company.description || "",
        email: company.email || "",
        phone: company.phone || "",
      });
    }
  }, [company]);

  if (!company) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCompany(form);
  };

  const fields = [
    { key: "name", label: t("company.name", "Naziv firme") },
    { key: "city", label: t("company.city", "Grad") },
    { key: "description", label: t("company.description", "Opis firme") },
    { key: "email", label: t("company.email", "Email") },
    { key: "phone", label: t("company.phone", "Telefon") },
  ];

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow mb-8">
      <h2 className="text-xl font-semibold mb-4 text-textDark">
        {t("company.my_company", "Moja firma")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map(({ key, label }) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
            placeholder={label}
            className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          />
        ))}

        <button
          type="submit"
          className="bg-accent text-cardBg px-6 py-2 rounded-xl font-semibold hover:bg-accentLight transition"
        >
          {t("company.update", "Ažuriraj firmu")}
        </button>
      </form>
    </div>
  );
};

export default CompanyInfo;
