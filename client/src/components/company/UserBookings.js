import React from "react";

const UserBookings = ({ bookings = [] }) => (
  <div className="bg-gray-200 p-6 rounded-2xl shadow mb-8">
    <h2 className="text-xl font-semibold mb-4 text-textDark">
      Moje rezervacije
    </h2>

    {bookings.length ? (
      <ul className="space-y-2">
        {bookings.map((b) => (
          <li
            key={b.booking_id}
            className="bg-white p-3 rounded-xl shadow-sm"
          >
            <div className="font-medium">{b.service}</div>
            <div className="text-sm text-muted">
              {new Date(b.slot_time).toLocaleString()}
            </div>
            <div className="text-sm">{b.status}</div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted">Nema rezervacija.</p>
    )}
  </div>
);


export default UserBookings;
