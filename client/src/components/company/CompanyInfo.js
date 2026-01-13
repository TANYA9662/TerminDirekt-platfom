import React, { useContext, useEffect, useState } from "react";
import { CompanyContext } from "../../context/CompanyContext";

const CompanyInfo = () => {
  const { company, updateCompany } = useContext(CompanyContext);

  const [form, setForm] = useState({
    name: "",
    city: "",
    description: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        city: company.city || "",
        description: company.description || "",
        email: company.email || "",
        phone: company.phone || ""
      });
    }
  }, [company]);

  if (!company) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCompany(form);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Moja firma</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Naziv firme"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Grad"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Opis"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Telefon"
          className="w-full border px-3 py-2 rounded"
        />

        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ažuriraj firmu
        </button>
      </form>
    </div>
  );
};

export default CompanyInfo;
