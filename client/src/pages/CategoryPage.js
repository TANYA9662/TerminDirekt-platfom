import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import CompanyCardCategory from "../components/home/CompanyCardCategory";
import BookingModal from "../components/modals/BookingModal";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { DEFAULT_COMPANY_IMAGE } from "../utils/imageUtils";

/* ================= MULTI LANGUAGE HELPER ================= */
const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.sr || field.en || field.sv || "";
  return "";
};

/* ================= NORMALIZE COMPANY DATA ================= */
const normalizeCompanies = (companiesRaw) =>
  (companiesRaw || []).map((company) => {
    const services = Array.isArray(company.services)
      ? company.services
      : typeof company.services === "string"
        ? (() => { try { return JSON.parse(company.services); } catch { return []; } })()
        : [];

    const slots = Array.isArray(company.slots)
      ? company.slots.map((slot) => ({
        ...slot,
        service_id: Number(slot.service_id),
        is_booked: !!slot.is_booked,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }))
      : [];

    const images =
      Array.isArray(company.images) && company.images.length > 0
        ? company.images.map((img) => ({ ...img, url: img.url || `/uploads/companies/${img.image_path}` }))
        : [{ image_path: "default.png", url: DEFAULT_COMPANY_IMAGE }];

    const reviews = Array.isArray(company.reviews) ? company.reviews : [];
    const avg_rating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

    return {
      ...company,
      services,
      slots,
      images,
      reviews,
      avg_rating,
      review_count: reviews.length,
    };
  });

/* ================= CATEGORY PAGE ================= */
const CategoryPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split("-")[0] || "sr";
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [category, setCategory] = useState({ name: "" });
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH CATEGORY & COMPANIES ================= */
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);

      const catRes = await API.get(`/categories/${id}?lang=${lang}`);
      setCategory(catRes.data || { name: "" });

      delete API.defaults.headers.common["Authorization"];
      const compRes = await API.get(`/categories/${id}/companies`);
      const companiesRaw = compRes.data || [];

      const detailedCompanies = await Promise.all(
        companiesRaw.map(async (company) => {
          const detailRes = await API.get(`/companies/${company.id}/details`);
          return detailRes.data;
        })
      );

      const normalized = normalizeCompanies(detailedCompanies);
      setCompanies(normalized);
      setFilteredCompanies(normalized);
    } catch (err) {
      console.error("fetchCompanies error:", err);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  /* ================= SEARCH FILTER ================= */
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) return setFilteredCompanies(companies);

    setFilteredCompanies(
      companies.filter(
        (c) =>
          getTranslated(c.name, lang).toLowerCase().includes(q) ||
          c.services?.some((s) => getTranslated(s.name, lang).toLowerCase().includes(q))
      )
    );
  }, [search, companies, lang]);

  /* ================= BOOKING HANDLER ================= */
  const handleBooking = async ({ service, slotId }) => {
    if (!user) {
      toast.error(t("home.must_login"));
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await API.post(
        "/bookings",
        { companyId: selectedCompany.id, service, slotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("home.booking_success"));
      setBookingOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(t("home.booking_error"));
    }
  };

  if (loading) return <p className="p-6">{t("categoryPage.loading")}</p>;
  if (!category) return <p className="p-6">{t("categoryPage.category_not_found")}</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-14 space-y-8">
        <h1 className="text-3xl font-semibold text-gray-800">{category.name}</h1>

        <input
          type="text"
          placeholder={t("categoryPage.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-3 rounded-xl ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length === 0 ? (
            <p className="text-gray-500">{t("home.no_companies")}</p>
          ) : (
            filteredCompanies.map((company) => (
              <CompanyCardCategory
                key={company.id}
                company={company}
                onBook={() => {
                  if (!user) navigate("/login");
                  else if (user.role !== "user") alert("Samo korisnici mogu rezervisati");
                  else {
                    setSelectedCompany(company);
                    setBookingOpen(true);
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {bookingOpen && selectedCompany && user?.role === "user" && (
        <BookingModal
          company={selectedCompany}
          onClose={() => {
            setSelectedCompany(null);
            setBookingOpen(false);
          }}
          onSubmit={handleBooking}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CategoryPage;
