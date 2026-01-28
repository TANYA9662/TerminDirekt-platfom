import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

const Hero = ({ search, setSearch, city, setCity, cities, onSearch }) => {
  const navigate = useNavigate();
  const { loading: authLoading } = useContext(AuthContext);
  const { status } = useContext(CompanyContext);

  if (authLoading || status === "loading") {
    return (
      <section className="min-h-[40vh] sm:min-h-[50vh] lg:min-h-[45vh] flex items-center justify-center bg-gray-100 ">
        <p className="text-xl font-semibold text-textDark">Učitavanje...</p>
      </section>
    );
  }

  return (
    <section className="relative w-full flex flex-col items-center justify-center bg-gray-100 pt-[18px] pb-10">
      <div
        className="w-full relative overflow-hidden -mt-15"
        style={{
          backgroundImage: "url('/uploads/companies/pozadina.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "40vh",
          minHeight: "280px",
        }}
      >
        {/* Tamni overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 flex flex-col justify-end items-center text-center h-full gap-10 pb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
            Zakažite termin online
          </h1>

          <div className="flex flex-col sm:flex-row justify-center gap-2 w-full max-w-3xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Pretraži firme ili usluge..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-bold placeholder:text-white/60 focus:ring-2 focus:ring-white transition"
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full sm:w-1/3 px-4 py-2 rounded-lg bg-white/10 text-white font-bold focus:ring-2 focus:ring-white transition"
            >
              <option value="">Sve lokacije</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={onSearch}
              className="w-full sm:w-1/3 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition"
            >
              Pretraži
            </button>
          </div>
        </div>
      </div>
    </section>

  );
};

export default Hero;
