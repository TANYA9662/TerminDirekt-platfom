import React, { useState, useEffect, useMemo } from "react";
import { absoluteUrl } from "../../utils/imageUtils";
import { useTranslation } from "react-i18next";

/* ================= MULTI LANGUAGE HELPER ================= */
const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.sr || field.en || field.sv || "";
  return "";
};

const BookingModal = ({ company, onClose, onSubmit }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "sr";

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const availableSlots = useMemo(() => {
    if (!company || !selectedServiceId) return [];
    return company.slots.filter(
      slot => Number(slot.service_id) === Number(selectedServiceId) && !slot.is_booked
    );
  }, [company, selectedServiceId]);

  useEffect(() => {
    if (!company?.services?.length) return;
    setSelectedServiceId(prev => prev ?? company.services[0].id);
  }, [company]);

  useEffect(() => {
    if (availableSlots.length === 0) {
      setSelectedSlotId(null);
      return;
    }
    setSelectedSlotId(prev => prev ?? availableSlots[0].id);
  }, [availableSlots]);

  if (!company) return null;

  const selectedService = company.services.find(s => Number(s.id) === Number(selectedServiceId));
  const companyName = getTranslated(company.name, lang);
  const companyDescription = getTranslated(company.description, lang);
  const images = company.images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{companyName}</h2>
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
        {companyDescription && (
          <p className="text-gray-600 leading-relaxed">{companyDescription}</p>
        )}

        {/* IMAGES */}
        {images.length > 0 && (
          <div className="flex gap-3 overflow-x-auto py-2">
            {images.map((img, i) => (
              <img
                key={img.id || i}
                src={absoluteUrl(img.url)}
                alt={`${companyName} ${i}`}
                onError={e => { e.target.style.display = "none"; }}
                className="w-32 h-32 object-cover rounded-xl shadow-sm flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              />
            ))}
          </div>
        )}

        {/* SERVICES */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-700 border-b border-gray-200 pb-1">
            {t("booking.services_and_prices", "Usluge i cene")}
          </h3>
          <div className="flex gap-3 overflow-x-auto py-2">
            {company.services.map(service => {
              const serviceName = getTranslated(service.name, lang);
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`flex-shrink-0 p-3 rounded-xl cursor-pointer border transition-all ${selectedServiceId === service.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:shadow-md"
                    }`}
                >
                  <div className="font-medium">{serviceName}</div>
                  <div className="text-sm">{service.duration} {t("booking.minutes", "min")}</div>
                  <div className="text-sm">{service.price.toLocaleString(lang === "en" ? "en-US" : "sr-RS")} RSD</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AVAILABLE SLOTS */}
        {availableSlots.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-700">
              {t("booking.available_slots", "Slobodni termini")}
            </h3>
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
                  {new Date(slot.start_time).toLocaleDateString(lang === "en" ? "en-GB" : lang === "sv" ? "sv-SE" : "sr-RS", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}{" "}
                  {new Date(slot.start_time).toLocaleTimeString(lang === "en" ? "en-GB" : lang === "sv" ? "sv-SE" : "sr-RS", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {t("booking.no_available_slots", "Nema slobodnih termina")}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {t("booking.cancel", "Otkaži")}
          </button>

          <button
            onClick={() => {
              if (!selectedService || !selectedSlotId) return;
              onSubmit({
                service: getTranslated(selectedService.name, lang),
                slotId: selectedSlotId
              });
            }}
            disabled={!selectedService || !selectedSlotId}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("booking.book_now", "Rezerviši")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingModal;