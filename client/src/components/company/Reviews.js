import React, { useState } from "react";
import API from "../../api";

const Reviews = ({
  reviews = [],
  companyId,
  canReview = false,
  averageRating = null,
  onNewReview,
}) => {
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);

  const submitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/companies/${companyId}/reviews`, form);
      setForm({ rating: 5, comment: "" });
      onNewReview && onNewReview();
    } catch (err) {
      console.error(err);
      alert("Ne možete ostaviti recenziju");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* average rate */}
      {averageRating && (
        <div className="text-lg font-semibold text-textDark">
          ⭐ {averageRating.toFixed(1)} / 5
        </div>
      )}

      {/* List recension */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-sm text-muted">Nema recenzija.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <div className="font-medium text-textDark">
                  {r.author_name || "Korisnik"}
                </div>
                <div className="text-accent font-semibold">
                  {r.rating}★
                </div>
              </div>
              <p className="text-sm text-textLight mt-1">
                {r.comment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      {canReview ? (
        <form
          onSubmit={submitReview}
          className="bg-gray-200 p-4 rounded-2xl shadow space-y-3"
        >
          <h4 className="font-semibold text-textDark">
            Dodaj recenziju
          </h4>

          <select
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: Number(e.target.value) })
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
            value={form.comment}
            onChange={(e) =>
              setForm({ ...form, comment: e.target.value })
            }
            rows={3}
            className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
            placeholder="Napiši recenziju..."
          />

          <div className="flex justify-end">
            <button
              disabled={loading}
              className="bg-accent text-cardBg px-5 py-2 rounded-xl hover:bg-accentLight transition disabled:opacity-50"
            >
              Pošalji
            </button>
          </div>
        </form>
      ) : (
        <div className="text-sm text-muted">
          Recenziju mogu ostaviti samo korisnici koji su imali termin.
        </div>
      )}
    </div>
  );
};

export default Reviews;
