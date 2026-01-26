import React, { useState } from "react";
import API from "../../api";

const Reviews = ({ reviews = [], companyId, onNewReview }) => {
  const [form, setForm] = useState({ rating: 5, text: "" });

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/companies/${companyId}/reviews`, form);
      setForm({ rating: 5, text: "" });
      onNewReview && onNewReview();
    } catch (err) {
      console.error(err);
      alert("Greška pri dodavanju recenzije");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-sm text-muted">Nema recenzija.</div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-textDark">
                  {r.author_name || "Gost"}
                </div>
                <div className="text-accent font-semibold">
                  {r.rating}★
                </div>
              </div>
              <p className="text-sm text-textLight mt-1">{r.text}</p>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={submitReview}
        className="bg-gray-200 p-4 rounded-2xl shadow space-y-3"
      >
        <h4 className="font-semibold text-textDark">Dodaj recenziju</h4>

        <select
          value={form.rating}
          onChange={(e) =>
            setForm({ ...form, rating: e.target.value })
          }
          className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}★
            </option>
          ))}
        </select>

        <textarea
          value={form.text}
          onChange={(e) =>
            setForm({ ...form, text: e.target.value })
          }
          rows={3}
          className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
          placeholder="Napiši recenziju..."
        />

        <div className="flex justify-end">
          <button className="bg-accent text-cardBg px-5 py-2 rounded-xl hover:bg-accentLight transition">
            Pošalji
          </button>
        </div>
      </form>
    </div>
  );
};


export default Reviews;
