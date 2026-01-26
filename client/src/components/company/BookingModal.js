import React, { useState, useEffect } from "react";
import API from "../../api";

const BookingModal = ({ company, services = [], onClose, onSuccess }) => {
  const [serviceId, setServiceId] = useState(services[0]?.id?.toString() || "");
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const freeSlots = company.slots?.filter(s => !s.is_booked) || [];
    setAvailableSlots(freeSlots);
    if (freeSlots.length > 0) setSlotId(freeSlots[0].id.toString());
  }, [company.slots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = parseInt(localStorage.getItem("user_id")) || null;
      const selectedSlot = availableSlots.find(s => s.id === parseInt(slotId));
      if (!selectedSlot) return alert("Izaberi validan slot");

      const payload = {
        user_id: userId,
        company_id: company.id,
        service_id: parseInt(serviceId),
        slot_id: parseInt(slotId),
        name,
        phone,
      };

      await API.post("/bookings", payload);
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
      <div className="bg-gray-100 rounded-2xl w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-textDark">
            Zakaži termin — {company.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-textDark transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Select za uslugu */}
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-textDark"
            required
          >
            <option value="">Izaberi uslugu</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.price ? `- ${s.price} RSD` : ""}
              </option>
            ))}
          </select>

          {/* Select za termin */}
          <select
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-textDark"
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

          {/* Ime i telefon */}
          <input
            type="text"
            placeholder="Ime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-textDark"
            required
          />
          <input
            type="text"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-textDark"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:border-textDark transition"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded border border-gray-300 hover:border-textDark transition"
            >
              Pošalji
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
