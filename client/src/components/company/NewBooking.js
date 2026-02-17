import React from "react";
import { useTranslation } from "react-i18next";

const NewBooking = ({
  slots,
  selectedSlot,
  setSelectedSlot,
  service,
  setService,
  handleBooking,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow mb-8">
      <h2 className="text-xl font-semibold mb-4 text-textDark">
        {t("booking.new_booking", "Napravite novu rezervaciju")}
      </h2>

      <form onSubmit={handleBooking} className="space-y-3">
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
          required
        >
          <option value="">{t("booking.select_slot", "Izaberite slot")}</option>
          {slots.map((s) => (
            <option key={s.slot_id} value={s.slot_id}>
              {s.provider_name} – {new Date(s.slot_time).toLocaleString()}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={t("booking.service", "Usluga")}
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full bg-white border border-gray-300 px-3 py-2 rounded-xl"
          required
        />

        <button
          type="submit"
          className="bg-accent text-cardBg px-6 py-2 rounded-xl font-semibold hover:bg-accentLight transition"
        >
          {t("booking.book_now", "Rezerviši")}
        </button>
      </form>
    </div>
  );
};

export default NewBooking;
