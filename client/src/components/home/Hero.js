import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

const Hero = ({ search = "", setSearch = () => { }, city = "", setCity = () => { }, cities = [] }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { status, companyComplete } = useContext(CompanyContext);

  const handleAccountClick = () => {
    if (!user) return navigate("/login");
    if (user.role === "company") {
      if (companyComplete) navigate("/company-dashboard");
      else navigate("/onboarding/company");
    } else {
      navigate("/");
    }
  };

  const handleSearch = () => {
    const query = search.trim();
    if (query || city) {
      navigate(`/companies?search=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
    }
  };

  // ⚠️ Blokiraj UI dok se učitava auth ili company
  if (authLoading || status === "loading") {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Učitavanje...</p>
      </section>
    );
  }

  return (
    <section className="bg-gray-400 min-h-screen text-white py-16">
      <div className="animate-fadeInUp p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Zakažite termin online</h1>
        <p className="text-white/80 mb-6">
          Frizeri, kozmetički saloni i wellness u vašem gradu
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          {!user ? (
            <>
              <button
                onClick={() => navigate("/register")}
                className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                Registrujte firmu
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                Prijavi se
              </button>
            </>
          ) : (
            <button
              onClick={handleAccountClick}
              disabled={status === "loading"}
              className={`bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition ${status === "loading" ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {user.role === "company"
                ? companyComplete
                  ? "Dashboard firme"
                  : "Moja firma"
                : "Moj nalog"}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Pretraži firme ili usluge..."
            className="w-full sm:w-2/3 border border-red-600 px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-black text-white placeholder-white"
          />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full sm:w-1/3 border border-red-600 px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-black text-white"
          >
            <option value="">Sve lokacije</option>
            {cities.length > 0
              ? cities.map((c) => <option key={c} value={c}>{c}</option>)
              : <option disabled>Nema dostupnih gradova</option>}
          </select>
          <button
            onClick={handleSearch}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Pretraži
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
