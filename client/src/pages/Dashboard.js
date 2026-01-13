import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import API from "../api";

const Dashboard = () => {
  const { user, loading, isCompany } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!loading && !isCompany) fetchBookings();
  }, [loading, isCompany]);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/me");
      setBookings(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju rezervacija:", err);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Da li ste sigurni?")) return;
    try {
      await API.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Greška pri otkazivanju rezervacije:", err);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-white">Učitavanje…</div>;

  if (isCompany)
    return (
      <div className="p-6 text-center text-red-600">
        Pristup zabranjen firmama
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-500 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Moj nalog</h1>
        <h2 className="text-xl font-semibold">Moje rezervacije</h2>

        {bookings.length === 0 && (
          <p className="text-gray-100">Nema rezervacija</p>
        )}

        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-gray-400 p-4 rounded shadow mb-2 flex justify-between items-center"
          >
            <span>
              {b.service} – {new Date(b.slot_time).toLocaleString()}
            </span>
            <button
              onClick={() => handleCancelBooking(b.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Otkaži
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
