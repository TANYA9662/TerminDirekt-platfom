import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export function SupportPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert(t("support.message_sent"));
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">{t("support.title")}</h1>

      <div className="bg-white shadow rounded-xl p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4">{t("support.contact")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t("support.form.name")}
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />
          <input
            type="email"
            name="email"
            placeholder={t("support.form.email")}
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />
          <textarea
            name="message"
            placeholder={t("support.form.message")}
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full border rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
            {t("support.form.submit")}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t("support.faq")}</h2>
        {t("support.faq_list", { returnObjects: true }).map((faq, i) => (
          <div key={i} className="border rounded-lg p-4 mb-2">
            <h3 className="font-semibold mb-1">{faq.q}</h3>
            <p className="text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}