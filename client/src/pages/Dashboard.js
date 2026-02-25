import React, { useEffect, useState, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import BookingModal from "../components/modals/BookingModal";
import CompanyCard from "../components/home/CompanyCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../api";
import { useTranslation } from "react-i18next";

// ================= HELPER =================
const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.sr || field.en || field.sv || "";
  return "";
};

// ================= ABSOLUTE URL HELPER =================
const absoluteUrl = (path) => {
  if (!path) return "http://localhost:3001/uploads/avatars/default.png";
  if (path.startsWith("http")) return path;
  return `http://localhost:3001${path.startsWith("/") ? "" : "/"}${path}`;
};

// ================= DASHBOARD =================
const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

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

  // ==== UPLOAD AVATAR ====
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
      toast.success(t("dashboard.avatar_updated"));
    } catch (err) {
      console.error(err);
      toast.error(t("dashboard.error_avatar_upload"));
    }
  };

  // ==== FETCH BOOKINGS ====
  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await API.get("/bookings/me", config);
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(t("dashboard.error_fetch_bookings"));
    }
  }, [t]);

  // ==== FETCH COMPANIES ====
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await API.get("/companies/user-view");
      const data = (res.data || []).map((c) => ({
        ...c,
        images: Array.isArray(c.images) ? c.images : [],
        services: c.services || [],
        slots: c.slots || [],
      }));
      setCompanies(data);
    } catch {
      toast.error(t("dashboard.error_fetch_companies"));
    }
  }, [t]);

  useEffect(() => {
    if (!loading && !isCompany) {
      fetchBookings();
      fetchCompanies();
    }
  }, [loading, isCompany, fetchBookings, fetchCompanies]);

  // ==== SAVE PROFILE ====
  const saveProfile = async () => {
    try {
      const res = await API.put("/auth/me", profileData);
      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success(t("dashboard.profile_updated"));
      setEditOpen(false);
    } catch {
      toast.error(t("dashboard.error_profile_update"));
    }
  };

  // ==== BOOKING HANDLERS ====
  const handleBooking = async ({ service, slotId }) => {
    if (!selectedCompany) return;
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/bookings",
        { companyId: selectedCompany.id, service, slotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("dashboard.booking_success"));
      setModalOpen(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error(t("dashboard.error_booking"));
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm(t("dashboard.confirm_cancel_booking"))) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await API.delete(`/bookings/${id}`, config);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.info(t("dashboard.booking_cancelled"));
    } catch (err) {
      console.error(err);
      toast.error(t("dashboard.error_cancel_booking"));
    }
  };

  if (loading) return <div className="p-6 text-center">{t("dashboard.loading")}</div>;
  if (isCompany) return <div className="p-6 text-center">{t("dashboard.access_denied")}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* PROFILE */}
        <div className="bg-white p-6 rounded-3xl shadow flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
              <img
                src={absoluteUrl(user?.avatar)}
                alt={t("dashboard.avatar_alt")}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name || t("dashboard.user")}</h2>
              <p className="text-gray-600">{user?.email}</p>
              {user?.phone && <p className="text-gray-600">{user.phone}</p>}
              {user?.city && <p className="text-gray-600">{user.city}</p>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-xl"
          >
            {t("dashboard.edit_profile")}
          </button>
        </div>

        {/* BOOKINGS */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("dashboard.my_bookings")}</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">{t("dashboard.no_bookings")}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-2xl ring-1 ring-gray-300 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-700">{getTranslated(b.company_name, lang)}</p>
                    <p className="text-gray-600 text-sm">
                      {b.service} – {new Date(b.start_time).toLocaleString("sr-RS")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-700"
                  >
                    {t("dashboard.cancel")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMPANIES */}
        <div className="grid md:grid-cols-3 gap-6">
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={{
                ...c,
                images: c.images.map((img) => ({ ...img, url: absoluteUrl(img.url) })),
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
            <h2 className="text-xl font-bold">{t("dashboard.edit_profile")}</h2>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} />

            <input
              className="w-full p-2 border rounded"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder={t("dashboard.name")}
            />
            <input
              className="w-full p-2 border rounded"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder={t("dashboard.email")}
            />
            <input
              className="w-full p-2 border rounded"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder={t("dashboard.phone")}
            />
            <input
              className="w-full p-2 border rounded"
              value={profileData.city}
              onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              placeholder={t("dashboard.city")}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditOpen(false)}>{t("dashboard.cancel")}</button>
              <button onClick={saveProfile} className="bg-indigo-600 text-white px-4 py-2 rounded">
                {t("dashboard.save")}
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