import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";
import API, { setLanguageHeader } from "../../api";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const { company, companyComplete, status: companyStatus } = useContext(CompanyContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const langMap = { rs: "sr", sr: "sr", en: "en", sv: "sv" };
  const lang = langMap[(i18n.language || "en").split("-")[0]] || "en";

  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get(`/categories?lang=${lang}`);
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [lang]);

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

  const getCategoryName = (cat) =>
    cat.name_translations?.[lang] || cat.name_translations?.en || cat.name || t("header.category");

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-100 shadow-md">
        <div className="max-w-8xl mx-auto px-2 py-4 flex items-center gap-2">

          {/* Logo levo */}
          <Link to="/" className="text-2xl font-bold text-gray drop-shadow-lg flex-shrink-0">
            {t("header.logo")}
          </Link>

          {/* Categories centrirano */}
          <nav className="hidden md:flex flex-1 justify-center gap-2 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-gray hover:bg-white/20 transition whitespace-nowrap"
              >
                {getCategoryName(cat)}
              </Link>
            ))}
          </nav>

          {/* User actions & language desno */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Language selector */}
            <select
              value={lang}
              onChange={(e) => {
                const newLang = langMap[e.target.value] || "en";
                i18n.changeLanguage(e.target.value);
                setLanguageHeader?.(newLang);
              }}
              className="px-2 py-1 rounded border border-gray-400"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="sr">🇷🇸 SR</option>
              <option value="sv">🇸🇪 SV</option>
            </select>

            {/* Account / Logout */}
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-white/20 border border-gray-400 font-bold hover:bg-accentLight transition"
                >
                  {t("header.register")}
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-white/20 border border-gray-400 font-bold hover:bg-white/40 transition"
                >
                  {t("header.login")}
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleAccountClick}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray font-bold hover:bg-white transition"
                >
                  {t("header.account")}
                </button>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray font-bold hover:bg-white/40 transition"
                >
                  {t("header.logout")}
                </button>
              </>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg border border-gray-400 shadow-lg ml-auto"
          >
            <div className="w-6 h-0.5 bg-gray-800 mb-1 transition-all"></div>
            <div className="w-6 h-0.5 bg-gray-800 mb-1 transition-all"></div>
            <div className="w-6 h-0.5 bg-gray-800 transition-all"></div>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )
      }

      {/* Mobile menu */}
      <aside
        className={`fixed top-0 right-0 h-full h-[100vh] w-72 bg-white shadow-2xl z-40 
  transform transition-transform duration-300 ease-in-out 
  md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="font-semibold text-lg">Menu</h2>
            <button onClick={() => setMenuOpen(false)} className="text-xl">✕</button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

            {/* Categories */}
            <div>
              <p className="text-xs uppercase text-gray-400 mb-2">Categories</p>
              <div className="space-y-2">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    {getCategoryName(cat)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="text-xs uppercase text-gray-400 mb-2">Language</p>
              <select
                value={lang}
                onChange={(e) => {
                  const newLang = langMap[e.target.value] || "en";
                  i18n.changeLanguage(e.target.value);
                  setLanguageHeader?.(newLang);
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="en">🇬🇧 English</option>
                <option value="sr">🇷🇸 Srpski</option>
                <option value="sv">🇸🇪 Svenska</option>
              </select>
            </div>

            {/* User Section */}
            <div>
              <p className="text-xs uppercase text-gray-400 mb-2">Account</p>
              <div className="flex flex-col gap-2">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 rounded-lg border text-center font-semibold hover:bg-gray-100 transition"
                    >
                      {t("header.register")}
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white text-center font-semibold hover:bg-black transition"
                    >
                      {t("header.login")}
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAccountClick}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-black transition"
                    >
                      {t("header.account")}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg border font-semibold hover:bg-gray-100 transition"
                    >
                      {t("header.logout")}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </aside>

    </>
  );
};

export default Header;
