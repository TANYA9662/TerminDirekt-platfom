// CompanyDashboard.js
import React, { useState, useContext, useEffect, useRef } from "react";
import { CompanyContext } from "../context/CompanyContext";
import CompanyImageUpload from "../components/company/CompanyImageUpload";
import { buildImageUrl } from "../utils/imageUtils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../api";
import { useTranslation } from "react-i18next";

// ================= MULTI LANGUAGE HELPER =================
const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.sr || field.en || field.sv || "";
  return "";
};

const CompanyDashboard = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { company, setCompany, updateCompany, updateCompanyServices, updateCompanySlots } =
    useContext(CompanyContext);

  const [loading, setLoading] = useState(true);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [newServiceCategoryId, setNewServiceCategoryId] = useState("");

  const colRef0 = useRef(null);
  const colRef1 = useRef(null);
  const colRef2 = useRef(null);

  // ---- Load company data, slots, categories ----
  useEffect(() => {
    if (!company?.id) return;

    setTempName(getTranslated(company.name, lang) || "");
    setTempDescription(getTranslated(company.description, lang) || "");
    setServices(Array.isArray(company.services) ? company.services : []);
    setSlots(Array.isArray(company.slots) ? company.slots : []);
    setLoading(false);

    // sve zavisnosti navedene, warning nestaje
  }, [company.id, company.name, company.description, company.services, company.slots, lang]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
      } catch (err) {
        console.error(t("companyDashboard.error_loading_categories"), err);
        setCategories([]);
      }
    };
    loadCategories();
  }, [t]);

  // ---- IntersectionObserver za animacije kolona ----
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.2 }
    );
    [colRef0, colRef1, colRef2].map(ref => ref.current).filter(Boolean).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---- Image handlers ----
  const handleDeleteImage = async (id) => {
    if (!window.confirm("Obrisati sliku?")) return;
    const image = company.images.find(img => img.id === id);
    if (!image?.id) return;

    try {
      await API.delete(`/companies/images/${image.id}`);
      setCompany(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== id)
      }));
      toast.info("Slika obrisana");
    } catch (err) {
      console.error("Greška pri brisanju slike:", err);
      toast.error("Greška pri brisanju slike");
    }
  };

  // ---- Services handlers ----
  const handleAddService = async (e) => {
    e.preventDefault();
    const categoryIdNum = Number(newServiceCategoryId);
    const priceNum = Number(newServicePrice);

    if (!newServiceName.trim() || isNaN(priceNum) || isNaN(categoryIdNum)) {
      return toast.error(t("companyDashboard.enter_service_name_price_category"));
    }

    const tempId = `temp-${Date.now()}`;
    const newService = {
      tempId,
      name: newServiceName.trim(),
      price: priceNum,
      duration: 60,
      category_id: categoryIdNum,
    };

    // Dodaj privremeno u state
    setServices(prev => [...prev, newService]);

    // Reset forme i fokus
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceCategoryId("");
    document.getElementById("newServiceNameInput")?.focus();
  };

  const handleDeleteService = (id) => {
    setServices(prev => prev.filter(s => String(s.id ?? s.tempId) !== String(id)));
    setSlots(prev => prev.filter(slot => String(slot.service_id) !== String(id) && String(slot.tempServiceId) !== String(id)));
    toast.info(t("companyDashboard.service_deleted"));
  };

  // ---- Slot handlers ----
  const handleAddSlot = (e) => {
    e.preventDefault();

    if (!newStart || !newEnd || !newServiceId) {
      return toast.error(t("companyDashboard.fill_all_slot_fields"));
    }

    const start = new Date(newStart);
    const end = new Date(newEnd);
    if (end <= start) return toast.error(t("companyDashboard.slot_end_after_start"));

    const service = services.find(s => String(s.id) === String(newServiceId));
    if (!service) return toast.error(t("companyDashboard.service_not_saved"));

    const newSlot = {
      id: `temp-${Date.now()}`,
      service_id: service.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      is_booked: false,
    };

    setSlots(prev => [...prev, newSlot]);
    setNewStart("");
    setNewEnd("");
    setNewServiceId("");
    toast.success(t("companyDashboard.slot_added_temp"));
  };

  const handleDeleteSlot = async (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.is_booked) return;

    if (slot.id.startsWith("temp-")) {
      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast.info(t("companyDashboard.slot_deleted"));
      return;
    }

    try {
      await API.delete(`/companies/${company.id}/slots/${slotId}`);
      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast.info(t("companyDashboard.slot_deleted"));
    } catch (err) {
      console.error(err);
      toast.error("Greška pri brisanju termina");
    }
  };

  // ---- Save all changes ----
  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateCompany({ id: company.id, name: tempName, description: tempDescription });

      const validServices = services
        .filter(s => s.name && !isNaN(s.price) && s.category_id)
        .map(s => ({ ...s, price: Number(s.price), category_id: Number(s.category_id) }));

      const newServices = validServices.filter(s => !s.id);
      let savedNewServices = [];
      if (newServices.length) savedNewServices = await updateCompanyServices(newServices);

      const serviceIdMap = {};
      savedNewServices.forEach(s => { if (s.tempId) serviceIdMap[s.tempId] = s.id; });

      const allServices = validServices.map(s => ({ ...s, id: s.id ?? serviceIdMap[s.tempId], tempId: undefined }));
      setServices(allServices);

      const slotsWithRealIds = slots
        .filter(s => !s.deleted)
        .map(s => ({ ...s, service_id: s.service_id ?? serviceIdMap[s.tempServiceId], tempServiceId: undefined }))
        .filter(s => s.service_id);

      const savedSlots = await updateCompanySlots(slotsWithRealIds);
      setSlots(savedSlots);
      setCompany(prev => ({ ...prev, slots: savedSlots }));

      toast.success("Sve izmene sačuvane i termini trajno dodati");
    } catch (err) {
      console.error("Greška pri čuvanju izmena:", err);
      toast.error("Greška pri čuvanju izmena");
    } finally {
      setLoading(false);
    }
  };

  // ---- Render helpers ----
  const formatDateTime = (start, end) => {
    if (!start || !end) return "Nepoznat termin";
    const s = new Date(start), e = new Date(end);
    const pad = n => n.toString().padStart(2, "0");
    return `${pad(s.getDate())}.${pad(s.getMonth() + 1)}.${s.getFullYear()} ${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(e.getHours())}:${pad(e.getMinutes())}`;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">{t("companyDashboard.loading")}</div>;
  if (!company) return <div className="p-6 text-center">Firma nije pronađena</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolona 0 - Info i slike */}
        <div ref={colRef0} className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">Info o firmi</h2>
            <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Naziv firme" className="w-full border p-2 rounded-lg" />
            <textarea value={tempDescription} onChange={e => setTempDescription(e.target.value)} placeholder="Opis firme" className="w-full border p-2 rounded-lg mt-2" />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">Slike</h2>
            <CompanyImageUpload
              companyId={company.id}
              existingImages={(company.images || []).map(img => ({ ...img, url: buildImageUrl(img) }))}
              onDeleteImage={handleDeleteImage}
              onUploadSuccess={(newImages) => setCompany(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }))}
            />
          </div>
        </div>

        {/* Kolona 1 - Usluge */}
        <div ref={colRef1} className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Usluge</h2>
          <form onSubmit={handleAddService} className="flex gap-2 flex-wrap mt-2">
            <input id="newServiceNameInput" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Naziv usluge" className="p-2 border rounded-lg" required />
            <input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Cena" type="number" className="p-2 border rounded-lg" required />
            <select value={newServiceCategoryId} onChange={e => setNewServiceCategoryId(e.target.value)} className="p-2 border rounded-lg" required>
              <option value="">Izaberite kategoriju</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <button type="submit" className="px-4 py-2 border rounded-lg hover:bg-gray-200">Dodaj</button>
          </form>
          <ul className="mt-2">
            {services.map((s, idx) => (
              <li key={s.id ?? `service-${idx}`} className="flex justify-between p-2 border rounded-lg mt-2">
                {s.name} — {s.price} RSD
                <button onClick={() => handleDeleteService(s.id ?? s.tempId)} className="text-red-600 hover:text-red-800">Obriši</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolona 2 - Termini */}
        <div ref={colRef2} className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Termini</h2>
          {slots.filter(s => !s.deleted).map((s, idx) => {
            const service = services.find(serv => String(serv.id ?? serv.tempId) === String(s.service_id ?? s.tempServiceId));
            const serviceName = service?.name || "Nepoznata usluga";
            return (
              <div key={s.id ?? `slot-${idx}`} className="p-2 border rounded-lg flex justify-between items-center mt-2">
                {formatDateTime(s.start_time, s.end_time)} ({serviceName})
                <button onClick={() => handleDeleteSlot(s.id)} disabled={s.is_booked} className="text-red-600 hover:text-red-800">Obriši</button>
              </div>
            );
          })}

          <form onSubmit={handleAddSlot} className="flex gap-2 flex-wrap mt-2">
            <input type="datetime-local" value={newStart} onChange={e => setNewStart(e.target.value)} className="border p-2 rounded-lg" required />
            <input type="datetime-local" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="border p-2 rounded-lg" required />
            <select value={newServiceId} onChange={e => setNewServiceId(e.target.value)} className="border p-2 rounded-lg" required>
              <option value="">Izaberite uslugu</option>
              {services.filter(s => s.id || s.tempId).map(s => (
                <option key={s.id ?? s.tempId} value={s.id ?? s.tempId}>{s.name}</option>
              ))}
            </select>
            <button type="submit" className="px-4 py-2 border rounded-lg hover:bg-gray-200">Dodaj termin</button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleFinish} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-2 rounded-3xl">Sačuvaj izmene</button>
      </div>
    </div>
  );
};

export default CompanyDashboard;