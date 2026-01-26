import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import API from "../api";
import BookingModal from "../components/modals/BookingModal";
import CompanyCard from "../components/home/CompanyCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getImageUrl } from '../utils/imageUtils';

const Dashboard = () => {
  const { user, loading, isCompany } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    if (!loading && !isCompany) {
      fetchBookings();
      fetchCompanies();
    }
  }, [loading, isCompany]);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/me");
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Greška pri učitavanju rezervacija");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get("/companies/user-view");
      const companiesData = (res.data || []).map((company) => {
        const images = company.images?.length > 0
          ? company.images.map(img => ({ ...img, url: getImageUrl(img) }))
          : [{ url: getImageUrl(null) }];

        return {
          ...company,
          images,
          services: company.services || [],
        };
      });
      setCompanies(companiesData);
    } catch (err) {
      console.error(err);
      toast.error("Greška pri učitavanju firmi");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da otkažete rezervaciju?")) return;
    try {
      await API.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.info("Rezervacija otkazana");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri otkazivanju rezervacije");
    }
  };

  const openBookingModal = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };


  const handleBookingSubmit = async ({ serviceId, slot }) => {
    if (!serviceId || !slot) {
      toast.error("Molimo izaberite uslugu i termin");
      return;
    }

    try {
      const res = await API.post("/bookings", {
        companyId: selectedCompany.id,
        serviceId,
        slot_time: slot,
      });

      setBookings(prev => [...prev, res.data]);
      setModalOpen(false);
      toast.success("Rezervacija uspešno kreirana!");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri kreiranju rezervacije");
    }
  };


  if (loading) return <div className="p-6 text-center text-textLight">Učitavanje…</div>;
  if (isCompany) return <div className="p-6 text-center text-accent">Pristup zabranjen firmama</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-200 text-textDark p-6">
        <h1 className="text-2xl font-bold mb-4">Moj nalog: {user?.name}</h1>

        <h2 className="text-xl font-semibold">Moje rezervacije</h2>
        {bookings.length === 0 ? (
          <p className="text-muted mt-2">Nemate rezervacija</p>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className="bg-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-md mb-2"
            >
              <div className="flex flex-col">
                <a
                  href={`/companies/${b.company_id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {b.company_name}
                </a>

                <span className="text-sm text-gray-600">
                  {b.service} – {new Date(b.start_time).toLocaleString("sr-RS")}
                </span>
              </div>


              <button
                onClick={() => handleCancelBooking(b.id)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
              >
                Otkaži
              </button>
            </div>
          ))
        )}

        <h2 className="text-xl font-semibold mt-8">Dostupne firme</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              onBook={openBookingModal}
              cardClass="bg-gray-100 text-textDark rounded-2xl shadow-md"
              buttonClass="bg-red-600 text-white hover:bg-red-700"
            />
          ))}
        </div>
      </div>

      {modalOpen && (
        <BookingModal
          company={selectedCompany}
          onClose={() => setModalOpen(false)}
          onSubmit={handleBookingSubmit}
        />
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
    </>
  );
};

export default Dashboard;
