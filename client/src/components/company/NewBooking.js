import React from "react";

const NewBooking = ({ slots, selectedSlot, setSelectedSlot, service, setService, handleBooking }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-2">Napravite novu rezervaciju</h2>
    <form onSubmit={handleBooking} className="space-y-2">
      <select
        value={selectedSlot}
        onChange={(e) => setSelectedSlot(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      >
        <option value="">Izaberite slot</option>
        {slots.map((s) => (
          <option key={s.slot_id} value={s.slot_id}>
            {s.provider_name} - {new Date(s.slot_time).toLocaleString()}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Usluga"
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Rezerviši
      </button>
    </form>
  </div>
);

export default NewBooking;
