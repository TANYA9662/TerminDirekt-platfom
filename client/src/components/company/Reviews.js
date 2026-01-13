import React, { useState } from "react";
import API from "../../api";

const Reviews = ({ reviews = [], companyId, onNewReview }) => {
  const [form, setForm] = useState({ rating: 5, text: "" });

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      // optional: require auth token
      await API.post(`/companies/${companyId}/reviews`, form);
      setForm({ rating: 5, text: "" });
      onNewReview && onNewReview();
    } catch (err) {
      console.error(err);
      alert("Greška pri dodavanju recenzije");
    }
  };

  return (
    <div>
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-sm text-gray-500">Nema recenzija.</div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="bg-white p-3 rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div className="font-medium">{r.author_name || "Gost"}</div>
                <div className="text-yellow-500">{r.rating}★</div>
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submitReview} className="mt-4 bg-white p-4 rounded shadow-sm">
        <h4 className="font-semibold mb-2">Dodaj recenziju</h4>
        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full border px-3 py-2 rounded mb-2">
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}★</option>)}
        </select>
        <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} className="w-full border px-3 py-2 rounded mb-2" placeholder="Napiši recenziju..." />
        <div className="flex justify-end">
          <button className="bg-primary text-white px-4 py-2 rounded">Pošalji</button>
        </div>
      </form>
    </div>
  );
};

export default Reviews;
