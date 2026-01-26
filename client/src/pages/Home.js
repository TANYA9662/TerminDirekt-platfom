import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import Hero from "../components/home/Hero";
import CompanyCard from "../components/home/CompanyCard";
import BookingModal from "../components/modals/BookingModal";
import { AuthContext } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUtils";
import { useNavigate } from "react-router-dom";

const normalizeCity = (value) => value?.trim().toLowerCase();

// Normalizacija firmi
const normalizeCompanies = (data) => {
  return (data || []).map((company) => {
    let services = [];
    if (Array.isArray(company.services)) services = company.services;
    else if (typeof company.services === "string") {
      try { services = JSON.parse(company.services); } catch { services = []; }
    }

    const slots = Array.isArray(company.slots)
      ? company.slots.map(slot => ({
        ...slot,
        service_id: Number(slot.service_id),
        start_time: slot.start_time,
        end_time: slot.end_time || null,
        is_booked: slot.is_booked || false,
      }))
      : [];

    const images = Array.isArray(company.images) && company.images.length > 0
      ? company.images.map(img => ({ ...img, url: getImageUrl(img) }))
      : [{ image_path: "default.png", url: getImageUrl({ image_path: "default.png" }) }];

    return { ...company, services, slots, images };
  });
};

const Home = () => {
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
        // Guest i običan korisnik: fetch bez tokena
        delete API.defaults.headers.common["Authorization"];

        const { data } = await API.get("/companies/user-view");
        const normalized = normalizeCompanies(data);

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
  }, [user]);

  const filteredCompanies = companies.filter((c) => {
    const query = search.trim().toLowerCase();
    const matchesName = c.name?.toLowerCase().includes(query);
    const matchesService = Array.isArray(c.services) && c.services.some((s) =>
      (s.name || s.title || "").toLowerCase().includes(query)
    );
    const matchesCity = city ? normalizeCity(c.city) === normalizeCity(city) : true;
    return (matchesName || matchesService || !query) && matchesCity;
  });

  const handleBooking = async ({ service, slotId }) => {
    try {
      const token = localStorage.getItem("token"); // token iz localStorage
      if (!token) {
        alert("Morate biti ulogovani da biste zakazali termin");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await API.post("/bookings", {
        companyId: selectedCompany.id,
        service,
        slotId,
      }, config);

      alert("Termin uspešno zakazan!");
      setSelectedCompany(null);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Greška pri zakazivanju termina");
    }
  };


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-900 bg-gray-300">
        Učitavanje...
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

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onBook={() => {
                  if (!user) {
                    // Guest -> odmah otvoriti login prompt
                    setSelectedCompany({ ...company, guestBooking: true });
                  } else if (user.role !== "user") {
                    // Firma -> ne može da bookuje
                    alert("Samo obični korisnici mogu da rezervišu termine");
                  } else {
                    // Obični korisnik -> booking modal
                    setSelectedCompany(company);
                  }
                }}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400">
              Nema firmi za prikaz
            </p>
          )}
        </div>
      </div>

      {/* Booking modal */}
      {selectedCompany && user && user.role === "user" ? (
        <BookingModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onSubmit={handleBooking}
        />
      ) : selectedCompany && (!user || selectedCompany.guestBooking) ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-xl">
            <p className="mb-4">Molimo ulogujte se da biste rezervisali termin.</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-accent px-4 py-2 rounded-lg text-white"
            >
              Ulogujte se
            </button>
            <button
              onClick={() => setSelectedCompany(null)}
              className="ml-2 px-4 py-2 rounded-lg bg-gray-300"
            >
              Otkaži
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Home;
