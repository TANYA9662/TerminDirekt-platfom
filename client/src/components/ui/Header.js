import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

const Header = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const { company, companyComplete, status: companyStatus } = useContext(CompanyContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Greška pri učitavanju kategorija");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleAccountClick = () => {
    if (!user) return navigate("/login");
    if (authLoading || companyStatus === "loading") return;

    if (user.role === "company") {
      if (!company || !companyComplete) navigate("/onboarding/company");
      else navigate("/company-dashboard");
    } else {
      navigate("/dashboard");
    }
    setMenuOpen(false);
  };

  const getCategoryName = (cat) => {
    if (typeof cat.name === "string") return cat.name;
    if (cat.name?.rs) return cat.name.rs?.toString();
    if (cat.name?.en) return cat.name.en?.toString();
    return "Kategorija";
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-100 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="text-2xl font-bold text-gray drop-shadow-lg">
            TerminDirekt
          </Link>

          {/* Desktop meni */}
          <ul className="hidden md:flex gap-1 flex-1 items-center overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <li key={cat.id} className="flex-shrink-0">
                <Link
                  to={`/category/${cat.id}`}
                  className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray"
                >
                  {getCategoryName(cat)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Dugmad Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
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
            ) : (
              <>
                <button
                  onClick={handleAccountClick}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray font-bold hover:bg-white transition"
                >
                  Moj nalog
                </button>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray font-bold hover:bg-white/40 transition"
                >
                  Odjava
                </button>
              </>
            )}
          </div>
          {/* Hamburger mobilni */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          >
            <span
              className={`block h-0.5 w-6 bg-gray-700 transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-gray-700 transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-gray-700 transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>

        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobilni meni sa animacijom */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-gray-100 shadow-2xl transform transition-transform duration-500 ease-in-out z-40 md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-gray font-semibold"
            >
              {getCategoryName(cat)}
            </Link>
          ))}

          <div className="mt-4 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/20 text-gray border border-gray-400 font-bold hover:bg-accentLight transition"
                >
                  Registrujte firmu
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/20 border border-gray-400 text-gray font-bold hover:bg-white/40 transition"
                >
                  Prijavi se
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleAccountClick}
                  className="px-4 py-2 rounded-lg bg-accent text-gray font-bold hover:bg-white transition"
                >
                  Moj nalog
                </button>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="px-4 py-2 rounded-lg bg-white/20 text-gray font-bold hover:bg-white/40 transition"
                >
                  Odjava
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header;
