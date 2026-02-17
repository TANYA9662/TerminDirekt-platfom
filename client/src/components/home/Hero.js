import React from "react";
import { absoluteUrl } from "../../utils/imageUtils";
import { useTranslation } from "react-i18next";

const Hero = ({ search, setSearch, city, setCity, cities, onSearch }) => {
  const { t } = useTranslation();
  const heroBackground = absoluteUrl("/uploads/companies/pozadina.jpg");

  return (
    <section className="relative w-full flex flex-col items-center justify-center bg-gray-100 pt-[18px] pb-10">
      <div
        className="w-full relative overflow-hidden -mt-15"
        style={{
          backgroundImage: `url('${heroBackground}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "40vh",
          minHeight: "280px",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 flex flex-col justify-end items-center text-center h-full gap-10 pb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
            {t("hero.title")}
          </h1>

          <div className="flex flex-col sm:flex-row justify-center gap-2 w-full max-w-3xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={t("hero.search_placeholder")}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-bold placeholder:text-white/60 focus:ring-2 focus:ring-white transition"
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full sm:w-1/3 px-4 py-2 rounded-lg bg-white/10 text-white font-bold focus:ring-2 focus:ring-white transition"
            >
              <option value="">{t("hero.all_locations")}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={onSearch}
              className="w-full sm:w-1/3 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition"
            >
              {t("hero.search_button")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
