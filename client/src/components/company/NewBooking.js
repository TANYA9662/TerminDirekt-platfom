import React from "react";

const NewBooking = ({
  slots,
  selectedSlot,
  setSelectedSlot,
  service,
  setService,
  handleBooking,
}) => (
  <div className="bg-gray-200 p-6 rounded-2xl shadow mb-8">
    <h2 className="text-xl font-semibold mb-4 text-textDark">
      Napravite novu rezervaciju
    </h2>

    <form onSubmit={handleBooking} className="space-y-3">
      <select
        value={selectedSlot}
        onChange={(e) => setSelectedSlot(e.target.value)}
        className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
        required
      >
        <option value="">Izaberite slot</option>
        {slots.map((s) => (
          <option key={s.slot_id} value={s.slot_id}>
            {s.provider_name} – {new Date(s.slot_time).toLocaleString()}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Usluga"
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
        required
      />

      <button
        type="submit"
        className="bg-accent text-cardBg px-6 py-2 rounded-xl font-semibold hover:bg-accentLight transition"
      >
        Rezerviši
      </button>
    </form>
  </div>
);


export default NewBooking;
