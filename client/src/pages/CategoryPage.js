import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompanyCardCategory from "../components/home/CompanyCardCategory";
import BookingModal from "../components/modals/BookingModal";
import { AuthContext } from "../context/AuthContext";
import API from "../api";

const normalizeCompanies = (data) => {
  return (data || []).map(company => {
    // --- SERVICES ---
    let services = [];
    if (Array.isArray(company.services)) {
      services = company.services;
    } else if (typeof company.services === "string") {
      try { services = JSON.parse(company.services); } catch { services = []; }
    }

    // --- SLOTS ---
    const slots = Array.isArray(company.slots)
      ? company.slots.map(slot => ({
        ...slot,
        service_id: Number(slot.service_id),
        is_booked: !!slot.is_booked,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }))
      : [];

    // --- IMAGES ---
    const images = Array.isArray(company.images) && company.images.length > 0
      ? company.images.map(img => ({
        ...img,
        url: img.url || `/uploads/companies/${img.image_path}`,
      }))
      : [{ image_path: "default.png", url: `/uploads/companies/default.png` }];

    return {
      ...company,
      services,
      slots,
      images,
    };
  });
};

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [category, setCategory] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch category info
      const catRes = await API.get(`/categories/${id}`);
      setCategory(catRes.data);

      // Fetch companies with details
      delete API.defaults.headers.common["Authorization"];
      const compRes = await API.get(`/categories/${id}/companies/details`);
      const normalized = normalizeCompanies(compRes.data);

      setCompanies(normalized);
      setFilteredCompanies(normalized);
    } catch (err) {
      console.error("CategoryPage fetchCompanies error:", err);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Search filter
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) return setFilteredCompanies(companies);

    setFilteredCompanies(
      companies.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.services?.some(s => (s.name || "").toLowerCase().includes(q))
      )
    );
  }, [search, companies]);

  const handleBooking = async ({ serviceId, service, slotId }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Morate biti ulogovani");
      return;
    }

    try {
      await API.post(
        "/bookings",
        { companyId: selectedCompany.id, service, slotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Termin uspešno zakazan!");
      setBookingOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (err) {
      console.error("Booking error:", err);
      alert("Greška pri rezervaciji termina");
    }
  };

  if (loading) return <p className="p-6">Učitavanje...</p>;
  if (!category) return <p className="p-6">Kategorija nije pronađena</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

        <input
          type="text"
          placeholder="Pretraži po usluzi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full md:w-1/3 p-2 border rounded"
        />

        {filteredCompanies.length === 0 ? (
          <p>Nema firmi za ovu kategoriju.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCompanies.map(company => (
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
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
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
    </div>
  );
};

export default CategoryPage;
