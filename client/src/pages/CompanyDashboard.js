// CompanyDashboard.js
import React, { useState, useContext, useEffect, useRef } from "react";
//import { useNavigate } from "react-router-dom";
import { CompanyContext } from "../context/CompanyContext";
import CompanyImageUpload from "../components/company/CompanyImageUpload";
//import { absoluteUrl } from "../utils/imageUtils";
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

  const { company, setCompany, updateCompany, updateCompanyServices, updateCompanySlots, setCompanyImages } =
    useContext(CompanyContext);


  //const navigate = useNavigate();

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
  //const initializedRef = useRef(false);


  // ---- Load company data, slots, categories ----
  useEffect(() => {
    if (!company?.id) return;

    setTempName(getTranslated(company.name, lang) || "");
    setTempDescription(getTranslated(company.description, lang) || "");
    setServices(Array.isArray(company.services) ? company.services : []);
    setSlots(Array.isArray(company.slots) ? company.slots : []);
    setLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, lang]);


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

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Obrisati sliku?")) return;
    const image = company.images.find(img => img.id === id);
    if (!image?.id) return;

    try {
      await API.delete(`/companies/images/${image.id}`);
      setCompanyImages(prev => prev.filter(img => img.id !== id));
      toast.info("Slika obrisana");
    } catch (err) {
      console.error("Greška pri brisanju slike:", err);
      toast.error("Greška pri brisanju slike");
    }
  };
  const uniqueImages = (company.images || []).reduce((acc, img) => {
    if (!img.id || !acc.find(i => i.id === img.id)) acc.push(img);
    return acc;
  }, []);

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

    // Dodaj privremeno u state da odmah vidimo
    setServices(prev => [...prev, newService]);

    try {
      // Sačuvaj odmah u backend-u
      const savedService = await updateCompanyServices([newService]); // backend vraća array sa id
      if (savedService.length) {
        const realService = savedService[0];
        setServices(prev => prev.map(s =>
          s.tempId === tempId ? { ...realService, tempId: undefined } : s
        ));
        setNewServiceId(realService.id); // postavi novi id za dropdown
        toast.success(t("companyDashboard.service_added"));
      }
    } catch (err) {
      console.error("Greška pri čuvanju nove usluge:", err);
      toast.error(t("companyDashboard.service_save_error") || "Greška pri čuvanju usluge");
    }

    // Reset forme i fokus na naziv
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

  // ---- Handle adding a slot ----
  const handleAddSlot = (e) => {
    e.preventDefault();

    if (!newStart || !newEnd || !newServiceId) {
      return toast.error(t("companyDashboard.fill_all_slot_fields") || "Popunite sve podatke za termin");
    }

    const start = new Date(newStart);
    const end = new Date(newEnd);
    if (end <= start) return toast.error(t("companyDashboard.slot_end_after_start") || "Kraj termina mora biti posle početka");

    // Pronađi izabranu uslugu
    const service = services.find(
      s => String(s.id) === String(newServiceId)
    );

    if (!service || !service.id) {
      return toast.error(t("companyDashboard.service_not_saved") || "Sačuvajte prvo novu uslugu da biste dodali slot")
    }

    const newSlot = {
      id: `temp-${Date.now()}`,
      service_id: service.id,       // koristi samo pravi ID
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      is_booked: false,
    };

    setSlots(prev => [...prev, newSlot]);

    setNewStart("");
    setNewEnd("");
    setNewServiceId("");

    toast.success(t("companyDashboard.slot_added_temp") || "Termin dodat (nije još trajno sačuvan)");
  };


  const handleDeleteSlot = async (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.is_booked) return;

    if (slot.id.startsWith("temp-")) {
      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast.info(t("companyDashboard.slot_deleted") || "Termin obrisan");
      return;
    }

    try {
      await API.delete(`/companies/${company.id}/slots/${slotId}`);
      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast.info(t("companyDashboard.slot_deleted") || "Termin obrisan");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri brisanju termina");
    }
  };

  // ---- Save all changes ----
  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1️⃣ Update osnovnih podataka firme
      await updateCompany({ id: company.id, name: tempName, description: tempDescription });

      // 2️⃣ Filtriraj validne usluge
      const validServices = services
        .filter(s => s.name && !isNaN(s.price) && s.category_id)
        .map(s => ({ ...s, price: Number(s.price), category_id: Number(s.category_id) }));

      // 3️⃣ Sačuvaj nove usluge (one bez id)
      const newServices = validServices.filter(s => !s.id);
      let savedNewServices = [];
      if (newServices.length) {
        savedNewServices = await updateCompanyServices(newServices); // backend vraća id
      }

      // 4️⃣ Mapiranje tempId -> real ID
      const serviceIdMap = {};
      savedNewServices.forEach(s => {
        if (s.tempId) serviceIdMap[s.tempId] = s.id;
      });

      // 5️⃣ Merge svih usluga u lokalni state sa real ID
      const allServices = validServices.map(s => ({
        ...s,
        id: s.id ?? serviceIdMap[s.tempId],
        tempId: undefined
      }));
      setServices(allServices);

      // 6️⃣ Priprema slotova sa real ID
      const slotsWithRealIds = slots
        .filter(s => !s.deleted)
        .map(s => ({
          ...s,
          service_id: s.service_id ?? serviceIdMap[s.tempServiceId],
          tempServiceId: undefined
        }))
        // filter out slotove koji još nemaju service_id (nisu sačuvane usluge)
        .filter(s => s.service_id);

      // 7️⃣ Sačuvaj slotove u backend
      const savedSlots = await updateCompanySlots(slotsWithRealIds);
      setSlots(savedSlots);
      setCompany(prev => ({
        ...prev,
        slots: savedSlots
      }));

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

  const renderServicesForm = () => (
    <form onSubmit={handleAddService} className="flex gap-2 flex-wrap mt-2">
      <input id="newServiceNameInput" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder={t("companyDashboard.enter_service_name")} className="p-2 border border-gray-400 shadow-2xl rounded-lg" required />
      <input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder={t("companyDashboard.enter_service_price")} type="number" className="p-2 border border-gray-400 shadow-2xl rounded-lg" required />
      <select value={newServiceCategoryId} onChange={e => setNewServiceCategoryId(e.target.value)} className="p-2 border border-gray-400 shadow-2xl rounded-lg" required>
        <option value="">{t("companyDashboard.select_category")}</option>
        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>
      <button type="submit" className="border border-gray-400 shadow-2xl text-black px-4 py-2 rounded-lg hover:bg-accentLight transition">{t("companyDashboard.add_service")}</button>
    </form>
  );

  const renderServicesList = () => (
    <ul className="mt-2">
      {services.map((s, idx) => (
        <li key={s.id ?? `service-${idx}`} className="flex justify-between p-2 border border-gray-400 shadow-2xl rounded-lg mt-2">
          {s.name} — {s.price} RSD
          <button onClick={() => handleDeleteService(s.id ?? s.tempId)} className="text-black hover:text-gray-600 transition">{t("companyDashboard.delete")}</button>
        </li>
      ))}
    </ul>
  );

  const renderSlots = () => {
    // Filter view avialible slots 
    const visibleSlots = slots.filter(s =>
      !s.deleted &&
      services.some(serv =>
        (s.service_id && String(serv.id) === String(s.service_id)) ||
        (s.tempServiceId && String(serv.tempId) === String(s.tempServiceId))
      )
    );

    if (!visibleSlots.length) return <p className="text-gray-500"></p>;

    // Sortiraj: new term (temp-) first
    const sortedSlots = [...visibleSlots].sort((a, b) => {
      const aTemp = a.id.startsWith("temp-");
      const bTemp = b.id.startsWith("temp-");
      if (aTemp && !bTemp) return -1;
      if (!aTemp && bTemp) return 1;
      return new Date(b.start_time) - new Date(a.start_time);
    });

    return sortedSlots.map((s, idx) => {
      const service = services.find(serv =>
        (s.service_id && String(serv.id) === String(s.service_id)) ||
        (s.tempServiceId && String(serv.tempId) === String(s.tempServiceId))
      );
      const serviceName = service?.name || t("companyDashboard.unknown_service");
      const duration = service?.duration || 60;
      const bookedStatus = s.is_booked ? t("companyDashboard.booked") : t("companyDashboard.free");

      return (
        <div key={s.id ?? `slot-${idx}`} className="relative group">
          <div className={`p-2 border shadow-2xl text-gray-800 rounded-lg flex justify-between items-center transition-colors duration-300
        ${s.is_booked ? "bg-red-100 border-red-400" : "bg-white border-gray-400 hover:bg-gray-100"}`}>
            <span className="font-medium">{formatDateTime(s.start_time, s.end_time)} ({serviceName}){s.is_booked && ` (${bookedStatus})`}</span>
            <button
              onClick={() => handleDeleteSlot(s.id)}
              disabled={s.is_booked}
              className={`px-2 py-1 rounded-lg text-black font-semibold transition-colors duration-200
            ${s.is_booked ? "bg-gray-400 cursor-not-allowed" : "border border-gray-400 shadow-2xl text-gray-600 hover:bg-gray-600 hover:text-white"}`}
            >
              {t("companyDashboard.delete")}
            </button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 bg-gray-800 text-white text-sm p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-pre-line z-50">
            {`Usluga: ${serviceName}\nPočetak – kraj: ${formatDateTime(s.start_time, s.end_time)}\nTrajanje: ${duration} min\nStatus: ${bookedStatus}`}
          </div>
        </div>
      );
    });
  };

  const renderSlotForm = () => (
    <form onSubmit={handleAddSlot} className="flex gap-2 flex-wrap items-center mt-2">
      <input type="datetime-local" value={newStart} onChange={e => setNewStart(e.target.value)} className="border border-gray-400 shadow-2xl p-2 rounded-lg" required />
      <input type="datetime-local" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="border border-gray-400 shadow-2xl p-2 rounded-lg" required />
      <select
        value={newServiceId}
        onChange={e => setNewServiceId(e.target.value)}
        className="border border-gray-400 shadow-2xl p-2 rounded-lg"
        required
      >
        <option value="">{t("companyDashboard.select_service")}</option>
        {services
          .filter(s => s.id)   // samo sačuvane usluge
          .map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>
      <button type="submit" className="border border-gray-400 shadow-2xl text-gray-600 px-4 py-2 rounded-lg hover:bg-accentLight transition">{t("companyDashboard.add_slot")}</button>
    </form>
  );


  if (loading) return <div className="flex justify-center items-center min-h-screen text-gray-900 bg-gray-100">{t("companyDashboard.loading")}</div>;
  if (!company) return <div className="p-6 text-center text-gray-900">{t("companyDashboard.company_not_found")}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KOLUMNA 0 */}
        <div ref={colRef0} className="transition-all duration-700 ease-out space-y-6">
          {/* Info o firmi */}
          <div className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800">{t("companyDashboard.company_info")}</h2>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              placeholder="Naziv firme"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
            <textarea
              value={tempDescription}
              onChange={e => setTempDescription(e.target.value)}
              placeholder="Opis firme"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          {/* Slike firme */}
          <div className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800">{t("companyDashboard.images")}</h2>

            <div className="mt-4">
              <CompanyImageUpload
                companyId={company.id}
                company={company}
                onDeleteImage={handleDeleteImage}
                existingImages={uniqueImages}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
              />

            </div>
          </div>
        </div>

        {/* KOLUMNA 1 - Usluge */}
        <div ref={colRef1} className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800">{t("companyDashboard.services")}</h2>
          {renderServicesForm()}
          {renderServicesList()}
        </div>

        {/* KOLUMNA 2 - Termini */}
        <div ref={colRef2} className="bg-white ring-1 ring-gray-300 rounded-3xl shadow-md p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800">{t("companyDashboard.slots")}</h2>
          {renderSlots()}
          {renderSlotForm()}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleFinish}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-2 rounded-3xl shadow-md transition"
        >
          {t("companyDashboard.save_changes")}
        </button>
      </div>
    </div>
  );
};

export default CompanyDashboard;