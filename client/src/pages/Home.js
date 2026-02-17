import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import Hero from "../components/home/Hero";
import CompanyCard from "../components/home/CompanyCard";
import BookingModal from "../components/modals/BookingModal";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const normalizeCity = (value) => value?.trim().toLowerCase();

/* ===== MULTI LANGUAGE HELPER ===== */
const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") {
    return field[lang] || field.sr || field.en || field.sv || "";
  }
  return "";
};

const normalizeCompanies = (data, lang) => {
  return (data || []).map((company) => {
    let services = [];
    if (Array.isArray(company.services)) services = company.services;
    else if (typeof company.services === "string") {
      try { services = JSON.parse(company.services); } catch { services = []; }
    }

    // Map services names to current language
    services = services.map((s) => ({
      ...s,
      name: getTranslated(s.name || s.title, lang),
      id: s.id,
    }));

    const slots = Array.isArray(company.slots)
      ? company.slots.map(slot => ({
        ...slot,
        service_id: Number(slot.service_id),
        start_time: slot.start_time,
        end_time: slot.end_time || null,
        is_booked: slot.is_booked || false,
      }))
      : [];

    const images =
      Array.isArray(company.images) && company.images.length > 0
        ? company.images
        : [{ id: "default", url: "/uploads/companies/default.png", isDefault: true }];

    return { ...company, services, slots, images, displayName: getTranslated(company.name, lang) };
  });
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const langMap = { en: "en", rs: "sr", sv: "sv" };
  const currentLang = langMap[i18n.language] || "sr";

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [companies, setCompanies] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        delete API.defaults.headers.common["Authorization"];
        const { data } = await API.get("/companies/user-view");
        const normalized = normalizeCompanies(data, currentLang);

        setCompanies(normalized);
        setCities([...new Set(normalized.map(c => c.city).filter(Boolean))]);
      } catch (err) {
        console.error(err);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [user, currentLang]);

  const filteredCompanies = companies.filter((c) => {
    const query = search.trim().toLowerCase();

    const companyName = c.displayName;
    const matchesName = companyName.toLowerCase().includes(query);

    const matchesService =
      Array.isArray(c.services) &&
      c.services.some((s) => s.name.toLowerCase().includes(query));

    const matchesCity = city
      ? normalizeCity(c.city) === normalizeCity(city)
      : true;

    return (matchesName || matchesService || !query) && matchesCity;
  });

  const handleBooking = async ({ service, slotId }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t("home.must_login"));
        return;
      }

      await API.post("/bookings", {
        companyId: selectedCompany.id,
        service,
        slotId,
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(t("home.booking_success"));
      setSelectedCompany(null);
    } catch (err) {
      console.error(err);
      toast.error(t("home.booking_error"));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-900 bg-gray-300">
        {t("loading")}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 text-textDark">
      <Hero
        search={search}
        setSearch={setSearch}
        city={city}
        setCity={setCity}
        cities={cities}
      />

      <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onBook={() => {
                  if (!user)
                    setSelectedCompany({ ...company, guestBooking: true });
                  else if (user.role !== "user")
                    toast.error(t("home.only_users_booking"));
                  else setSelectedCompany(company);
                }}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400">
              {t("home.no_companies")}
            </p>
          )}
        </div>
      </div>

      {selectedCompany && user?.role === "user" && (
        <BookingModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onSubmit={handleBooking}
        />
      )}

      {selectedCompany && (!user || selectedCompany.guestBooking) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-xl">
            <p className="mb-4">{t("home.login_to_book")}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-accent px-4 py-2 rounded-lg text-white"
            >
              {t("home.login")}
            </button>
            <button
              onClick={() => setSelectedCompany(null)}
              className="ml-2 px-4 py-2 rounded-lg bg-gray-300"
            >
              {t("home.cancel")}
            </button>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Home;
