import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

const Header = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const { company, companyComplete, status: companyStatus } = useContext(CompanyContext);
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (!user) return navigate("/login");
    if (authLoading || companyStatus === "loading") return;

    if (user.role === "company") {
      if (!company || !companyComplete) navigate("/onboarding/company");
      else navigate("/company-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6 bg-transparent">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray drop-shadow-lg">
          TerminDirekt
        </Link>

        {/* Horizontalni meni */}
        <ul className="flex gap-2 overflow-x-auto no-scrollbar flex-1 items-center">
          <li className="flex-shrink-0">
            <Link to="/frizeri/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Frizeri
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link to="/masaza/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Masaža
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link to="/nokti/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Nokti
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link to="/trepavice-obrve/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Trepavice & Obrve
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link to="/lepota/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Lepota
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link to="/zdravlje/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Zdravlje
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link to="/last-minute/srbija" className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray">
              Last Minute
            </Link>
          </li>
        </ul>

        {/* Dugmad */}
        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-white/20 text-gray border border-gray-400 shadow-2xl font-bold hover:bg-accentLight transition"
              >
                Registrujte firmu
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-white/20 border border-gray-400 shadow-2xl text-gray font-bold hover:bg-white/40 transition"
              >
                Prijavi se
              </Link>
            </>
          )}

          {user && (
            <>
              <button
                onClick={handleAccountClick}
                className="px-4 py-2 rounded-lg bg-accent text-gray font-bold hover:bg-white transition"
              >
                Moj nalog
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-white/20 text-gray font-bold hover:bg-white/40 transition"
              >
                Odjava
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
