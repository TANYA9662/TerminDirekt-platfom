import React, { useState, useEffect, useContext } from "react";
import API, { setAuthToken } from "../api";
import Hero from "../components/home/Hero";
import CompanyCard from "../components/home/CompanyCard";
import AdvancedSlider from "../components/home/AdvancedSlider";
import BookingModal from "../components/company/BookingModal";
import { AuthContext } from "../context/AuthContext";

const allowedCategories = [
  "Frizer", "Barber", "Kozmetika", "Masaža",
  "Spa", "Wellness", "Fitness", "Zdravlje", "Usluge"
];

const Home = () => {
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [companies, setCompanies] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get("/companies");

        const filtered = res.data.filter(c =>
          allowedCategories.includes(c.category)
        );

        setCompanies(filtered);

        const uniqueCities = [
          ...new Set(filtered.map(c => c.city).filter(Boolean))
        ];
        setCities(uniqueCities);

      } catch (err) {
        console.error("Greška pri učitavanju firmi:", err);
      }
    };

    fetchCompanies();
  }, []);

  const handleBook = async (company) => {
    if (!user) {
      alert("Morate biti prijavljeni.");
      return;
    }

    try {
      setSelectedCompany(company);
      const res = await API.get(`/slots/company/${company.id}`);
      setSlots(res.data.filter(s => !s.is_booked));
    } catch (err) {
      console.error(err);
      setSlots([]);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) &&
    (city ? c.city?.toLowerCase() === city.toLowerCase() : true)
  );

  return (
    <div className="min-h-screen bg-gray-500 text-white">
      {/* Hero section */}
      <Hero
        search={search}
        setSearch={setSearch}
        city={city}
        setCity={setCity}
        cities={cities}
        className="bg-gray-400 text-white"
      />

      {/* Slider */}
      <AdvancedSlider companies={companies.slice(0, 5)} className="bg-gray-400 text-white" />

      {/* Companies grid */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCompanies.length ? (
          filteredCompanies.map(c => (
            <CompanyCard
              key={c.id}
              company={c}
              onBook={handleBook}
              cardClass="bg-gray-400 text-white"
              buttonClass="bg-red-600 text-white hover:bg-red-700"
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-100">
            Nema firmi za prikaz
          </p>
        )}
      </div>

      {/* Booking modal */}
      {selectedCompany && (
        <BookingModal
          company={selectedCompany}
          services={selectedCompany.services || []}
          slots={slots}
          onClose={() => setSelectedCompany(null)}
          modalClass="bg-gray-400 text-white"
          buttonClass="bg-red-600 text-white hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default Home;
