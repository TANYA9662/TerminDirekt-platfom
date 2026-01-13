// src/components/BookingCard.js
import React from "react";


const BookingCard = ({ booking }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h3 className="font-semibold text-lg">{booking.service}</h3>
        <p className="text-gray-600">
          {new Date(b.slot_time).toLocaleString()} - {booking.status}
        </p>
        <p className="text-gray-500">{booking.provider_name}</p>
      </div>
    </div>
  );
};

export default BookingCard;
