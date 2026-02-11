import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import BookingModal from "../components/modals/BookingModal";
import ServiceList from "../components/company/ServiceList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { absoluteUrl } from "../utils/imageUtils";


const CompanyPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [bookedSlotId, setBookedSlotId] = useState(null);

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/companies/${id}/details`);
      setCompany(res.data);
    } catch (err) {
      console.error(err);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await API.get(`/reviews?companyId=${id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCompany();
      await fetchReviews();
    };
    fetchData();
  }, [fetchCompany, fetchReviews]);

  const handleBooking = async ({ service, slotId }) => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/bookings",
        { companyId: company.id, service, slotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookedSlotId(slotId);
      setBookingOpen(false);

      // 3️⃣ toast
      toast.success("Termin uspešno zakazan!");

    } catch (err) {
      console.error(err);
      toast.error("Greška pri rezervaciji termina");
    }
  };


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Morate biti ulogovani da ostavite recenziju");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/reviews",
        { companyId: company.id, rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewRating(5);
      setNewComment("");
      fetchReviews();
      toast.success("Recenzija dodata");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri dodavanju recenzije");
    }
  };

  if (loading) return <p className="p-6">Učitavanje...</p>;
  if (!company) return <p className="p-6">Firma nije pronađena</p>;

  const canReview = user?.role === "user";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <div className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md overflow-hidden">
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-semibold text-gray-800">{company.name}</h1>
          {company.city && <p className="text-gray-500">{company.city}</p>}
          {company.description && <p className="text-gray-600">{company.description}</p>}
          {user?.role === "user" && company.slots?.length > 0 && (
            <button
              onClick={() => setBookingOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Rezerviši termin
            </button>
          )}

        </div>
        {company.images?.length > 0 && (
          <div className="flex gap-4 px-6 pb-6 overflow-x-auto">
            {company.images.map((img, idx) => (
              <img
                key={idx}
                src={absoluteUrl(img.url)}
                alt={`slika-${idx}`}
                className="w-72 h-44 object-cover rounded-2xl ring-1 ring-gray-300 shadow-sm flex-shrink-0"
                onError={(e) => e.target.src = absoluteUrl("/uploads/companies/default.png")}
              />
            ))}
          </div>
        )}
      </div>

      {/* SERVICES */}
      {company.services?.length > 0 && (
        <div className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Usluge i cene</h2>
          <ServiceList services={company.services} />
        </div>
      )}

      {/* REVIEWS */}
      <div className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Recenzije</h2>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-gray-50 ring-1 ring-gray-200">
                <p className="font-semibold text-gray-800">{rev.user_name || "Korisnik"}</p>
                <p className="text-sm text-gray-600">Ocena: {rev.rating}</p>
                {rev.comment && <p className="mt-1 text-gray-700">{rev.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nema recenzija</p>
        )}
        {canReview && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Ocena (1–5)
              <input
                type="number"
                min="1"
                max="5"
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                required
                className="mt-1 w-24 p-2 rounded-lg ring-1 ring-gray-300"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Komentar
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-1 w-full p-3 rounded-lg ring-1 ring-gray-300"
                placeholder="Ostavite komentar"
              />
            </label>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Pošalji recenziju
            </button>
          </form>
        )}
      </div>
      {/* BOOKING MODAL */}
      {bookingOpen && company && (
        <BookingModal
          company={company}
          slots={company.slots || []}
          onClose={() => setBookingOpen(false)}
          onSubmit={handleBooking}
          bookedSlotId={bookedSlotId}
        />
      )}
      {/* TOAST */}
      <ToastContainer position="top-right" autoClose={3000} newestOnTop pauseOnHover />
    </div>
  );
};

export default CompanyPage;
