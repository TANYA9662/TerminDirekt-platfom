import React, { useEffect, useState, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import API from "../api";
import { useTranslation } from "react-i18next";

// ================= HELPERS =================
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

  useEffect(() => {
    if (!loading && !isCompany) fetchBookings();
  }, [loading, isCompany, fetchBookings]);

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

  // ==== CANCEL BOOKING ====
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

  // ==== GET NEXT BOOKING ====
  const nextBooking = bookings
    .filter((b) => new Date(b.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">

        {/* ===== PROFILE ===== */}
        <div className="bg-white p-6 rounded-3xl shadow flex flex-col md:flex-row items-center gap-6">
          <div className="flex gap-4 items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
              <img src={absoluteUrl(user?.avatar)} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              {user?.phone && <p className="text-gray-600">{user.phone}</p>}
              {user?.city && <p className="text-gray-600">{user.city}</p>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
          >
            {t("dashboard.edit_profile")}
          </button>
        </div>

        {/* ===== STATISTICS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-sm text-gray-500">{t("dashboard.total_bookings")}</p>
            <p className="text-xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-sm text-gray-500">{t("dashboard.completed")}</p>
            <p className="text-xl font-bold">{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-sm text-gray-500">{t("dashboard.cancelled")}</p>
            <p className="text-xl font-bold">{bookings.filter(b => b.status === 'cancelled').length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-sm text-gray-500">{t("dashboard.next_appointment")}</p>
            <p className="text-xl font-bold">
              {nextBooking
                ? new Date(nextBooking.start_time).toLocaleDateString(lang, {
                  dateStyle: "medium",
                })
                : "-"}
            </p>
          </div>
        </div>

        {/* ===== QUICK LINKS ===== */}
        <div className="bg-white p-6 rounded-3xl shadow grid grid-cols-2 md:grid-cols-4 gap-6">
          <a href="/support" className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-xl">
            <span className="text-2xl">💬</span>
            <p className="text-sm mt-2">{t("dashboard.quick_support")}</p>
          </a>
          <a href="/dashboard/settings" className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-xl">
            <span className="text-2xl">⚙️</span>
            <p className="text-sm mt-2">{t("dashboard.quick_settings")}</p>
          </a>
          <a href="/dashboard/notifications" className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-xl">
            <span className="text-2xl">🔔</span>
            <p className="text-sm mt-2">{t("dashboard.quick_notifications")}</p>
          </a>
          <a href="/dashboard/help" className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-xl">
            <span className="text-2xl">❓</span>
            <p className="text-sm mt-2">{t("dashboard.quick_help")}</p>
          </a>
        </div>

        {/* ===== BOOKINGS ===== */}
        <div className="bg-white p-6 rounded-3xl shadow space-y-4">
          <h2 className="text-xl font-semibold">{t("dashboard.my_bookings")}</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">{t("dashboard.no_bookings")}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-gray-50 p-4 rounded-2xl shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium">{b.company_name}</p>
                    <p className="text-gray-600 text-sm">{b.service} – {new Date(b.start_time).toLocaleString(lang, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}</p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-700"
                  >
                    {t("dashboard.cancel")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ===== PROFILE MODAL ===== */}
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

      <ToastContainer />
    </div>
  );
};

export default Dashboard;