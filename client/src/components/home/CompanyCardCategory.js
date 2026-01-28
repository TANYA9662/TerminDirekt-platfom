import React, { useState, useEffect } from "react";
import { getImageUrl } from "../../utils/imageUtils";

const CompanyCardCategory = ({ company, onBook }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(
    company.services?.[0]?.id || ""
  );
  const [selectedSlotId, setSelectedSlotId] = useState("");


  // Kad se promeni usluga, automatski izaberi prvi slobodni slot
  useEffect(() => {
    const service = company.services.find(s => s.id === selectedServiceId);
    setSelectedSlotId(service?.slots?.[0]?.id ?? "");
  }, [selectedServiceId, company.services]);

  const handleBook = () => {
    if (!selectedServiceId || !selectedSlotId) return;

    const service = company.services.find(
      (s) => s.id === selectedServiceId
    );
    const slot = service?.slots.find(
      (s) => s.id === selectedSlotId
    );

    if (service && slot) {
      onBook({ companyId: company.id, service, slot });
    }
  };

  const selectedService = company.services.find(
    (s) => s.id === selectedServiceId
  );
  const serviceSlots = selectedService?.slots || [];

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 bg-white flex flex-col">

      {/* Slika */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-3xl">
        <img
          src={company.images?.[0]?.url || getImageUrl({ image_path: "default.png" })}
          alt={company.name}
          className="w-full h-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 bg-black/40 w-full p-2 text-white font-semibold">
          {company.name}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {company.city && <p className="text-gray-500">{company.city}</p>}

        {/* Izbor usluge */}
        <div>
          <label className="block font-semibold mb-1">Izaberite uslugu:</label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            className="w-full border rounded p-2"
          >
            {company.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.price} RSD ({s.duration} min)
              </option>
            ))}
          </select>
        </div>

        {/* Izbor termina */}
        <div>
          <label className="block font-semibold mb-1">Slobodni termini:</label>
          {serviceSlots.length > 0 ? (
            <select
              value={selectedSlotId || ""}
              onChange={(e) => setSelectedSlotId(Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              {serviceSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.start_time).toLocaleString()} —{" "}
                  {new Date(slot.end_time).toLocaleTimeString()}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-500">Nema slobodnih termina</p>
          )}
        </div>

        <button
          onClick={handleBook}
          disabled={!selectedSlotId}
          className="mt-4 py-2 w-full bg-gray-300 text-black font-bold rounded hover:bg-gray-500 transition disabled:opacity-50"
        >
          Rezerviši
        </button>
      </div>
    </div>
  );
};

export default CompanyCardCategory;
