import React from "react";

const UserBookings = ({ bookings }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-2">Moje rezervacije</h2>
    <ul className="list-disc list-inside">
      {bookings.length ? (
        bookings.map((b) => (
          <li key={b.booking_id}>
            {b.service} - {new Date(s.slot_time).toLocaleString()} - {b.status}
          </li>
        ))
      ) : (
        <p>Nema rezervacija.</p>
      )}
    </ul>
  </div>
);

export default UserBookings;
