import React from "react";
import { useTranslation } from "react-i18next";

const ServiceList = ({ services = [] }) => {
  const { t } = useTranslation();

  if (!services.length)
    return (
      <div className="text-sm text-gray-600">
        {t("services.no_services", "Firma nije postavila usluge.")}
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-3">
      {services.map((s) => (
        <div
          key={s.id}
          className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"
        >
          <div>
            <div className="font-medium text-textDark">{s.name}</div>
            {s.duration && (
              <div className="text-sm text-gray-600">
                {s.duration} {t("services.minutes", "min")}
              </div>
            )}
          </div>
          <div className="font-semibold text-textDark">
            {s.price ? `${s.price} RSD` : t("services.negotiable", "Po dogovoru")}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
