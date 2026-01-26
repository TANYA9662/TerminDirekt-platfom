import React from "react";

const ServiceList = ({ services = [] }) => {
  if (!services.length)
    return (
      <div className="text-sm text-muted">
        Firma nije postavila usluge.
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
            <div className="font-medium text-textDark">
              {s.name}
            </div>
            {s.duration && (
              <div className="text-sm text-muted">
                {s.duration} min
              </div>
            )}
          </div>
          <div className="font-semibold text-textDark">
            {s.price ? `${s.price} RSD` : "Po dogovoru"}
          </div>
        </div>
      ))}
    </div>
  );
};


export default ServiceList;
