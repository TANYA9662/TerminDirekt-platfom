import React, { useState, useEffect } from "react";
import API from "../../api";

const BookingModal = ({ company, services = [], slots = [], onClose, onSuccess }) => {
  // Uvek čuvamo slotId kao string radi <select>
  const [serviceId, setServiceId] = useState(services[0]?.id?.toString() || "");
  const [slotId, setSlotId] = useState(slots[0]?.id?.toString() || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  // Filtriraj slobodne slotove kad se otvori modal
  useEffect(() => {
    const freeSlots = slots.filter(s => !s.is_booked);
    setAvailableSlots(freeSlots);
    if (freeSlots.length > 0) setSlotId(freeSlots[0].id.toString());
  }, [slots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = parseInt(localStorage.getItem("user_id")) || null;

      // Strogo poređenje koristeći === i konvertujući slotId u number
      const selectedSlot = slots.find(s => s.id === parseInt(slotId));

      if (!selectedSlot) {
        alert("Izaberi validan slot");
        return;
      }

      const payload = {
        user_id: userId,
        company_id: company.id,
        service_id: parseInt(serviceId),
        slot_id: parseInt(slotId),
        name,
        phone,
      };

      // Kreiraj rezervaciju
      await API.post("/bookings", payload);

      // Obeleži slot kao booked
      await API.put(`/slots/${slotId}`, { is_booked: true });

      onSuccess && onSuccess(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Greška pri slanju rezervacije");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Zakaži termin — {company.name}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Izbor usluge */}
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Izaberi uslugu</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.price ? `- ${s.price} RSD` : ""}
              </option>
            ))}
          </select>

          {/* Izbor slobodnog slota */}
          <select
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            {availableSlots.length === 0 ? (
              <option value="">Nema slobodnih termina</option>
            ) : (
              availableSlots.map(s => (
                <option key={s.id} value={s.id.toString()}>
                  {new Date(s.slot_time).toLocaleString()} - {new Date(s.end_time).toLocaleTimeString()}
                </option>
              ))
            )}
          </select>

          <input
            type="text"
            placeholder="Ime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">
              Otkaži
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">
              Pošalji
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
