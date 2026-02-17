import React from "react";
import { useTranslation } from "react-i18next";

const UserBookings = ({ bookings = [] }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow mb-8">
      <h2 className="text-xl font-semibold mb-4 text-textDark">
        {t("dashboard.my_bookings", "Moje rezervacije")}
      </h2>

      {bookings.length ? (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li
              key={b.booking_id}
              className="bg-white p-3 rounded-xl shadow-sm"
            >
              <div className="font-medium">{b.service}</div>
              <div className="text-sm text-gray-600">
                {new Date(b.slot_time).toLocaleString()}
              </div>
              <div className="text-sm">{t(`bookings.status.${b.status}`, b.status)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">{t("dashboard.no_bookings", "Nema rezervacija.")}</p>
      )}
    </div>
  );
};

export default UserBookings;
