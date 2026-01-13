// src/components/Bookings.js
import React, { useEffect, useState } from "react";
import API from "../api";
import BookingCard from "./BookingCard";


const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/bookings");
        setBookings(res.data);
      } catch (err) {
        console.error("Greška pri učitavanju rezervacija:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 mt-6">Učitavanje rezervacija...</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-center text-gray-600 mt-6">Nemate rezervacija.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Moje rezervacije</h2>
      {bookings.map((booking) => (
        <BookingCard key={booking.booking_id} booking={booking} />
      ))}
    </div>
  );
};

export default Bookings;
