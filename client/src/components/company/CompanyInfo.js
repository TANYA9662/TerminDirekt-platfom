import React, { useContext, useEffect, useState } from "react";
import { CompanyContext } from "../../context/CompanyContext";

const CompanyInfo = () => {
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

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow mb-8">
      <h2 className="text-xl font-semibold mb-4 text-textDark">
        Moja firma
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {["name", "city", "description", "email", "phone"].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            placeholder={field}
            className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
          />
        ))}

        <button
          type="submit"
          className="bg-accent text-cardBg px-6 py-2 rounded-xl font-semibold hover:bg-accentLight transition"
        >
          Ažuriraj firmu
        </button>
      </form>
    </div>
  );
};


export default CompanyInfo;
