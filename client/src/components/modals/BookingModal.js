import React, { useState, useEffect, useMemo } from "react";
import { getImageUrl } from "../../utils/imageUtils";

const BookingModal = ({ company, onClose, onSubmit }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  // 1️⃣ Memoized available slots
  const availableSlots = useMemo(() => {
    if (!company || !selectedServiceId) return [];
    return company.slots.filter(
      slot => Number(slot.service_id) === Number(selectedServiceId) && !slot.is_booked
    );
  }, [company, selectedServiceId]);

  // 2️⃣ Default service & slot
  useEffect(() => {
    if (!company?.services?.length) return;

    const defaultServiceId = company.services[0].id;
    setSelectedServiceId(prev => prev ?? defaultServiceId);
  }, [company]);

  useEffect(() => {
    if (availableSlots.length === 0) {
      setSelectedSlotId(null);
      return;
    }
    setSelectedSlotId(prev => prev ?? availableSlots[0].id);
  }, [availableSlots]);

  if (!company) return null;

  const images =
    company.images?.length > 0
      ? company.images.map(img => getImageUrl(img))
      : [getImageUrl(null)];

  const selectedService = company.services.find(s => Number(s.id) === Number(selectedServiceId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{company.city}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* DESCRIPTION */}
        {company.description && (
          <p className="text-gray-600 leading-relaxed">{company.description}</p>
        )}

        {/* IMAGES */}
        {images.length > 0 && (
          <div className="flex gap-3 overflow-x-auto py-2">
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${company.name} ${i}`}
                className="w-32 h-32 object-cover rounded-xl shadow-sm flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              />
            ))}
          </div>
        )}

        {/* SERVICES AS CARDS */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-700 border-b border-gray-200 pb-1">Usluge i cene</h3>
          <div className="flex gap-3 overflow-x-auto py-2">
            {company.services.map(service => (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`flex-shrink-0 p-3 rounded-xl cursor-pointer border transition-all ${selectedServiceId === service.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:shadow-md"
                  }`}
              >
                <div className="font-medium">{service.name}</div>
                <div className="text-sm">{service.price.toLocaleString("sr-RS")} RSD</div>
              </div>
            ))}
          </div>
        </div>

        {/* SLOTS AS CARDS */}
        {availableSlots.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-700">Slobodni termini</h3>
            <div className="flex gap-3 overflow-x-auto py-2">
              {availableSlots.map(slot => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl cursor-pointer border transition-all ${selectedSlotId === slot.id
                    ? "bg-green-500 text-white border-green-500 shadow-lg"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:shadow-md"
                    }`}
                >
                  {new Date(slot.start_time).toLocaleString("sr-RS")}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nema slobodnih termina</p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Otkaži
          </button>
          <button
            onClick={() => {
              if (!selectedService || !selectedSlotId) return;
              onSubmit({
                service: selectedService.name,
                slotId: selectedSlotId,
              });
            }}
            disabled={!selectedSlotId || !selectedService}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Rezerviši
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
