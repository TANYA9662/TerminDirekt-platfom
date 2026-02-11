import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import BookingModal from "../components/modals/BookingModal";
import CompanyCard from "../components/home/CompanyCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { absoluteUrl } from "../utils/imageUtils";
import API from "../api";

const Dashboard = () => {
  const { user, setUser, loading, isCompany } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  // ==== INIT PROFILE ====
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await API.put("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
      toast.success("Slika profila je ažurirana");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri uploadu slike");
    }
  };

  // ==== FETCH BOOKINGS ====
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await API.get("/bookings/me", config);
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Greška pri učitavanju rezervacija");
    }
  };
  const fetchCompanies = async () => {
    try {
      const res = await API.get("/companies/user-view");

      const data = (res.data || []).map(c => ({
        ...c,
        images: Array.isArray(c.images) && c.images.length > 0
          ? c.images
          : [],
        services: c.services || [],
        slots: c.slots || [],
      }));

      setCompanies(data);
    } catch {
      toast.error("Greška pri učitavanju firmi");
    }
  };

  useEffect(() => {
    if (!loading && !isCompany) {
      fetchBookings();
      fetchCompanies();
    }
  }, [loading, isCompany]);

  const saveProfile = async () => {
    try {
      const res = await API.put("/auth/me", profileData);
      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success("Profil ažuriran");
      setEditOpen(false);
    } catch {
      toast.error("Greška pri ažuriranju profila");
    }
  };
  const handleBooking = async ({ service, slotId }) => {
    if (!selectedCompany) return;

    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/bookings",
        { companyId: selectedCompany.id, service, slotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Termin uspešno zakazan!");
      setModalOpen(false);
      fetchBookings(); // refresuj liste
    } catch (err) {
      console.error(err);
      toast.error("Greška pri rezervaciji termina");
    }
  };

  // ==== CANCEL BOOKING ====
  const handleCancelBooking = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da otkažete rezervaciju?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await API.delete(`/bookings/${id}`, config);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.info("Rezervacija otkazana");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri otkazivanju rezervacije");
    }
  };

  if (loading) return <div className="p-6 text-center">Učitavanje…</div>;
  if (isCompany) return <div className="p-6 text-center">Pristup zabranjen</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* PROFIL */}
        <div className="bg-white p-6 rounded-3xl shadow flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
              <img
                src={absoluteUrl(user?.avatar) || absoluteUrl("/uploads/avatars/default.png")}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name || "Korisnik"}</h2>
              <p className="text-gray-600">{user?.email}</p>
              {user?.phone && <p className="text-gray-600">{user.phone}</p>}
              {user?.city && <p className="text-gray-600">{user.city}</p>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-xl"
          >
            Uredi profil
          </button>
        </div>

        {/* MOJE REZERVACIJE */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Moje rezervacije</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">Nemate rezervacija</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-2xl bg-white ring-1 ring-gray-300 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-700">{b.company_name}</p>
                    <p className="text-gray-600 text-sm">
                      {b.service} – {new Date(b.start_time).toLocaleString("sr-RS")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-700"
                  >
                    Otkaži
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FIRME */}
        <div className="grid md:grid-cols-3 gap-6">
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={{
                ...c,
                images: c.images.map(img => ({
                  ...img,
                  url: absoluteUrl(img.url),
                })),
              }}
              onBook={(co) => {
                setSelectedCompany(co);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* PROFILE MODAL */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-3">
            <h2 className="text-xl font-bold">Uredi profil</h2>

            <input type="file" accept="image/*" onChange={handleAvatarUpload} />

            <input
              className="w-full p-2 border rounded"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              placeholder="Ime"
            />
            <input
              className="w-full p-2 border rounded"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              placeholder="Email"
            />
            <input
              className="w-full p-2 border rounded"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              placeholder="Telefon"
            />
            <input
              className="w-full p-2 border rounded"
              value={profileData.city}
              onChange={(e) =>
                setProfileData({ ...profileData, city: e.target.value })
              }
              placeholder="Grad"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditOpen(false)}>Otkaži</button>
              <button
                onClick={saveProfile}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {modalOpen && (
        <BookingModal
          company={selectedCompany}
          onClose={() => setModalOpen(false)}
          onSubmit={handleBooking}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
