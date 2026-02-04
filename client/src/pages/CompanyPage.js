import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import BookingModal from "../components/modals/BookingModal";
import ServiceList from "../components/company/ServiceList";

const CompanyPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  // Fetch company details
  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/companies/${id}/details`);

      // NE DIRAJ slots
      setCompany(res.data);
    } catch (err) {
      console.error("Greška pri fetchu firme:", err);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews?companyId=${id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Greška pri fetchu recenzija:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCompany();
      await fetchReviews();
    };
    fetchData();
  }, [id]);

  const handleBooking = async ({ service, slotId }) => {
    if (!user) {
      alert("Morate biti ulogovani da rezervišete termin");
      return;
    }

    try {
      await API.post(
        "/bookings",
        { companyId: company.id, service, slotId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Termin uspešno zakazan!");
      setBookingOpen(false);
      fetchCompany(); // refresh slotove
    } catch (err) {
      console.error(err);
      alert("Greška pri rezervaciji termina");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Morate biti ulogovani da ostavite recenziju");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token nije pronađen");

      await API.post(
        "/reviews",
        {
          companyId: company.id,
          rating: newRating,
          comment: newComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewRating(5);
      setNewComment("");
      fetchReviews();
    } catch (err) {
      console.error("Greška pri dodavanju recenzije:", err);
      alert("Greška pri dodavanju recenzije");
    }
  };

  if (loading) return <p className="p-6">Učitavanje...</p>;
  if (!company) return <p className="p-6">Firma nije pronađena</p>;

  const canReview = user?.role === "user";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{company.name}</h1>
        {company.city && <p className="text-gray-500">{company.city}</p>}
        {company.description && <p>{company.description}</p>}

        {/* IMAGES */}
        {company.images?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {company.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`slika-${idx}`}
                className="w-64 h-40 object-cover rounded-xl shadow"
              />
            ))}
          </div>
        )}
        {/* BOOKING BUTTON */}
        {user?.role === "user" && company.slots?.length > 0 && (
          <button
            onClick={() => setBookingOpen(true)}
            className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Rezerviši termin
          </button>
        )}
      </div>
      {/* SERVICES */}
      {company.services?.length > 0 && (
        <div className="bg-gray-200 p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-xl font-semibold mb-3 text-textDark">
            Usluge i cene
          </h2>
          <ServiceList services={company.services} />
        </div>
      )}

      {/* REVIEWS */}
      <div className="bg-gray-200 p-6 rounded-2xl shadow space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Recenzije</h2>
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="border-b border-gray-300 py-2">
              <p className="font-semibold">{rev.user_name || "Korisnik"}</p>
              <p>Ocena: {rev.rating}</p>
              {rev.comment && <p>{rev.comment}</p>}
            </div>
          ))
        ) : (
          <p>Nema recenzija</p>
        )}

        {canReview && (
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-2">
            <label className="block">
              Ocena (1-5):
              <input
                type="number"
                min="1"
                max="5"
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                required
                className="ml-2 p-1 border rounded"
              />
            </label>
            <label className="block">
              Komentar:
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ostavite komentar"
              />
            </label>
            <button
              type="submit"
              className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
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
          onClose={() => setBookingOpen(false)}
          onSubmit={handleBooking}
        />
      )}
    </div>
  );
};

export default CompanyPage;
