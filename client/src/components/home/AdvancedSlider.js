import React from "react";
import CompanyCard from "./CompanyCard";

const AdvancedSlider = ({ companies }) => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 animate-fadeInUp">Popularna firma</h2>
        <div className="grid grid-cols-1 gap-6">
          {companies.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvancedSlider;
