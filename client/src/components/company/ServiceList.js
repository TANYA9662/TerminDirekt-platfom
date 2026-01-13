import React from "react";

const ServiceList = ({ services = [] }) => {
  if (!services.length) return <div className="text-sm text-gray-500">Firma nije postavila usluge.</div>;

  return (
    <div className="grid grid-cols-1 gap-3">
      {services.map(s => (
        <div key={s.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
          <div>
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-gray-500">{s.duration ? `${s.duration} min` : ""}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{s.price ? `${s.price} RSD` : "Po dogovoru"}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
