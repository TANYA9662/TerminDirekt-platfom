import React, { useState, useEffect, useMemo } from "react";
import { getImageUrl } from "../../utils/imageUtils";

const BookingModal = ({ company, onClose, onSubmit }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // 1️⃣ Memoized available slots
  const availableSlots = useMemo(() => {
    if (!company || !selectedServiceId) return [];
    return company.slots.filter(
      slot =>
        Number(slot.service_id) === Number(selectedServiceId) &&
        !slot.is_booked &&
        slot.id
    );
  }, [company, selectedServiceId]);

  // 2️⃣ Default service
  useEffect(() => {
    if (!company?.services?.length) return;
    setSelectedServiceId(prev => prev ?? company.services[0].id);
  }, [company]);

  // 3️⃣ Default slot
  useEffect(() => {
    if (!availableSlots.length) {
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot(prev => prev ?? availableSlots[0]);
  }, [availableSlots]);

  if (!company) return null;

  const images =
    company.images?.length > 0
      ? company.images.map(img => getImageUrl(img))
      : [getImageUrl(null)];

  const selectedService = company.services.find(
    s => Number(s.id) === Number(selectedServiceId)
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 p-6 rounded-2xl w-full max-w-3xl space-y-4 overflow-y-auto max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-textDark">{company.name}</h2>
          <button onClick={onClose} className="bg-accent text-cardBg px-3 py-1 rounded-lg">
            ✕
          </button>
        </div>

        {/* IMAGES */}
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <img key={i} src={url} className="w-32 h-32 object-cover rounded-lg" />
          ))}
        </div>

        <p className="text-textLight">{company.description}</p>
        <p className="text-sm text-muted">{company.city}</p>

        {/* SERVICES */}
        <div>
          <h3 className="font-semibold text-lg">Usluge i cene</h3>
          <ul className="mt-2 space-y-2">
            {company.services.map(s => (
              <li key={s.id} className="flex justify-between bg-gray-200 p-2 rounded-lg">
                <span>{s.name}</span>
                <span>{s.price} RSD</span>
              </li>
            ))}
          </ul>
        </div>

        {/* BOOKING */}
        <div className="space-y-3">
          <select
            value={selectedServiceId ?? ""}
            onChange={e => {
              setSelectedServiceId(Number(e.target.value));
              setSelectedSlot(null);
            }}
            className="w-full p-2 rounded-lg bg-gray-200"
          >
            {company.services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.price} RSD
              </option>
            ))}
          </select>

          {availableSlots.length > 0 ? (
            <select
              value={selectedSlot?.id ?? ""}
              onChange={e => {
                const slot = availableSlots.find(
                  s => s.id === Number(e.target.value)
                );
                setSelectedSlot(slot);
              }}
              className="w-full p-2 rounded-lg bg-gray-200"
            >
              {availableSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.start_time).toLocaleString("sr-RS")}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-muted">Nema slobodnih termina</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">
            Otkaži
          </button>
          <button
            onClick={() =>
              onSubmit({
                service: selectedService?.name,
                slotId: selectedSlot?.id,
              })
            }
            disabled={!selectedSlot || !selectedService}
            className="bg-accent text-white px-4 py-2 rounded-lg"
          >
            Rezerviši
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
