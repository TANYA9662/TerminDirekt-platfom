import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CompanyCardCategory from "../components/home/CompanyCardCategory"; // promenjeno ovde

const CategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [servicesFilter, setServicesFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Dohvatanje kategorije i firmi sa detaljima (services + slots + images)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`/api/categories/${id}`);
        if (!catRes.ok) throw new Error("Kategorija nije pronađena");
        const catData = await catRes.json();
        setCategory(catData);

        const compRes = await fetch(`/api/categories/${id}/companies/details`);
        if (!compRes.ok) throw new Error("Ne mogu da učitam firme");
        const compData = await compRes.json();
        setCompanies(compData);
      } catch (err) {
        console.error(err);
        setCategory(null);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Filter po nazivu usluge
  useEffect(() => {
    if (!servicesFilter) {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(c =>
        c.services?.some(s =>
          s.name.toLowerCase().includes(servicesFilter.toLowerCase())
        )
      );
      setFilteredCompanies(filtered);
    }
  }, [servicesFilter, companies]);

  if (loading) return <p className="p-6">Učitavanje kategorije...</p>;
  if (!category) return <p className="p-6">Kategorija nije pronađena</p>;

  const handleBooking = async ({ companyId, service, slot }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Niste ulogovani!");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          service: service.name,
          slotId: slot.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Booking error:", data);
        alert(`Greška: ${data.message}`);
      } else {
        console.log("Rezervacija uspešna:", data);
        alert("Termin uspešno zakazan!");

        // fetchCategoryCompanies(); // npr. ponovo pozvati fetch
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Došlo je do greške prilikom zakazivanja termina.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

      {/* Filter po uslugama */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pretraži po usluzi..."
          value={servicesFilter}
          onChange={(e) => setServicesFilter(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <p>Nema firmi koje odgovaraju filteru.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCardCategory
              key={company.id}
              company={company}
              onBook={handleBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
