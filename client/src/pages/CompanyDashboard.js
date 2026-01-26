import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyContext } from "../context/CompanyContext";
import CompanyImageUpload from "../components/company/CompanyImageUpload";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getImageUrl } from "../utils/imageUtils";

import API from "../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";


const CompanyDashboard = () => {
  const { company, updateCompany, updateCompanyServices, updateCompanySlots, setCompanyImages } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newServiceId, setNewServiceId] = useState("");

  const colRef0 = useRef(null);
  const colRef1 = useRef(null);
  const colRef2 = useRef(null);

  // Učitavanje podataka firme, termina i slika
  useEffect(() => {
    if (!company?.id) return;

    setTempName(company.name || "");
    setTempDescription(company.description || "");
    setServices(Array.isArray(company.services) ? company.services : []);

    const loadSlotsAndImages = async () => {
      try {
        const resSlots = await API.get(`/companies/${company.id}/slots`);
        setSlots(resSlots.data.slots || []);
      } catch (err) {
        console.error("Greška pri učitavanju termina :", err);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlotsAndImages();
  }, [company?.id, company.name, company.description, company.services]);

  // IntersectionObserver za animacije kolona
  useEffect(() => {
    const colRefs = [colRef0, colRef1, colRef2]; // pomeramo unutar useEffect
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.2 }
    );

    colRefs
      .map((ref) => ref.current)
      .filter(Boolean)
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []); // prazna dependency lista sada, warning je uklonjen

  // Dodavanje nove slike
  const handleUploadSuccess = (imagesFromDb) => {
    setCompanyImages(imagesFromDb);
  };

  // Brisanje slike
  const handleDeleteImage = async (index) => {
    if (!window.confirm("Obrisati sliku?")) return;

    const image = company.images[index];
    if (!image?.id) return;

    try {
      await API.delete(`/companies/images/${image.id}`);
      const filtered = company.images.filter((_, i) => i !== index);
      setCompanyImages(filtered);
      toast.info("Slika obrisana");
    } catch (err) {
      console.error("Greška pri brisanju slike:", err);
      toast.error("Greška pri brisanju slike");
    }
  };

  // Dodavanje usluge
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return toast.error("Unesite naziv i cenu usluge");

    const tempId = `temp-${Date.now()}`;
    const newService = { tempId, name: newServiceName.trim(), price: Number(newServicePrice), duration: 60 };
    setServices((prev) => [...prev, newService]);
    setNewServiceName("");
    setNewServicePrice("");
    toast.success("Usluga dodata, sačuvaj je pre dodavanja termina");
  };

  // Brisanje usluge
  const handleDeleteService = (id) => {
    setServices((prev) => prev.filter((s) => String(s.id ?? s.tempId) !== String(id)));
    setSlots((prev) => prev.filter((slot) => String(slot.service_id) !== String(id) && String(slot.tempServiceId) !== String(id)));
    toast.info("Usluga obrisana");
  };

  // Dodavanje termina
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newStart || !newEnd || !newServiceId) return toast.error("Popunite sve podatke za termin");

    const service = services.find((s) => String(s.id) === String(newServiceId) || s.tempId === newServiceId);
    if (!service) return toast.error("Morate sačekati da servis bude sačuvan pre dodavanja termina");

    const newSlot = {
      id: `temp-${Date.now()}`,
      service_id: Number(newServiceId) || undefined,
      tempServiceId: service.tempId || undefined,
      start_time: newStart,
      end_time: newEnd,
      is_booked: false,
    };
    setSlots((prev) => [...prev, newSlot]);
    setNewStart("");
    setNewEnd("");
    setNewServiceId("");
    toast.success("Termin dodat");
  };

  // Brisanje termina
  const handleDeleteSlot = async (slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.is_booked) return;

    try {
      await API.delete(`/slots/${slotId}`);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.info("Termin obrisan");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri brisanju termina");
    }
  };

  // Čuvanje svih izmena
  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateCompany({ id: company.id, name: tempName, description: tempDescription });

      const updatedServices = await updateCompanyServices(services);

      const serviceIdMap = {};
      updatedServices.forEach((s) => {
        if (s.tempId) serviceIdMap[s.tempId] = s.id;
      });

      const slotsWithRealIds = slots.map((slot) => ({
        ...slot,
        service_id: serviceIdMap[slot.service_id] ?? slot.service_id,
      }));

      const savedSlots = await updateCompanySlots(slotsWithRealIds);
      setSlots(savedSlots);

      toast.success("Sve izmene sačuvane");
      navigate("/profile");
    } catch (err) {
      console.error("Greška pri čuvanju izmena:", err);
      toast.error("Greška pri čuvanju izmena");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-gray-900 bg-gray-100">Učitavanje...</div>;
  if (!company) return <div className="p-6 text-center text-gray-900">Firma nije pronađena.</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-6 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Company info & Images */}
        <div ref={colRef0} className="transition-all duration-700 ease-out space-y-6">
          <div className="bg-cardBg p-6 rounded-2xl shadow-md space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-xl font-semibold text-textDark">Informacije o firmi</h2>
            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Naziv firme" className="w-full border border-gray-400 shadow-2xl p-2 rounded-lg" />
            <textarea value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} placeholder="Opis firme" className="w-full border border-gray-400 shadow-2xl p-2 rounded-lg" />
          </div>

          <div className="bg-cardBg p-6 border border-gray-400 shadow-2xlrounded-2xl shadow-md space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
            <h2 className="text-xl font-semibold text-textDark">Slike</h2>
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide relative z-10">
              {(company.images || []).map((img, idx) => (
                <div key={img.id ?? `img-${idx}`} className="relative w-40 h-40 flex-shrink-0 group overflow-hidden rounded-lg border border-gray-400 shadow-2xl">
                  <img src={getImageUrl(img)} alt={img.alt || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => (e.target.src = getImageUrl(null))} />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button onClick={() => handleDeleteImage(idx)} className="bg-gray-300 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-accentLight transition-all duration-300">Obriši</button>
                  </div>
                </div>
              ))}
            </div>
            <CompanyImageUpload companyId={company.id} onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>

        {/* Services */}
        <div ref={colRef1} className="bg-cardBg border border-gray-400 shadow-2xl p-6 rounded-2xl space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold text-textDark">Usluge</h2>
          <form onSubmit={handleAddService} className="flex gap-2 flex-wrap">
            <input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Naziv usluge" className="p-2 border border-gray-400 shadow-2xl rounded-lg" required />
            <input value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="Cena" type="number" className="p-2 border border-gray-400 shadow-2xl rounded-lg" required />
            <button type="submit" className="border border-gray-400 shadow-2xl text-black px-4 py-2 rounded-lg hover:bg-accentLight transition">Dodaj</button>
          </form>
          <ul>
            {services.map((s, idx) => (
              <li key={s.id ?? `service-${idx}`} className="flex justify-between p-2 border border-gray-400 shadow-2xl rounded-lg mt-2">
                {s.name} — {s.price} RSD
                <button onClick={() => handleDeleteService(s.id)} className="text-black hover:text-gray-600 transition">Obriši</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Slots */}
        <div ref={colRef2} className="bg-cardBg border border-gray-400 shadow-2xl p-6 rounded-2xl shadow-md space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold text-textDark">Termini</h2>
          {slots
            .filter((s) =>
              services.some((serv) => String(serv.id) === String(s.service_id))
            )
            .length > 0 ? (
            slots
              .filter((s) =>
                services.some((serv) => String(serv.id) === String(s.service_id))
              )
              .map((s, idx) => (
                <div
                  key={s.id ?? `slot-${idx}`}
                  className="p-2 border border-gray-400 shadow-2xl text-gray-600 rounded-lg flex justify-between items-center"
                >
                  <span>
                    <span>
                      {s.start_time && s.end_time
                        ? `${new Date(s.start_time).toLocaleString()} – ${new Date(
                          s.end_time
                        ).toLocaleTimeString()}`
                        : "Nepoznat termin"}
                    </span>
                    {` (${services.find(
                      (serv) => String(serv.id) === String(s.service_id)
                    )?.name
                      })`}
                    {s.is_booked && " (rezervisan)"}
                  </span>

                  <button
                    onClick={() => handleDeleteSlot(s.id)}
                    disabled={s.is_booked}
                    className={`px-2 py-1 rounded-lg text-black ${s.is_booked
                      ? "bg-gray-600 cursor-not-allowed"
                      : "border border-gray-400 shadow-2xl text-gray-600 hover:bg-gray-600"
                      }`}
                  >
                    Obriši
                  </button>
                </div>
              ))
          ) : (
            <p className="text-gray-500">Nema termina</p>
          )}

          <form onSubmit={handleAddSlot} className="flex gap-2 flex-wrap items-center mt-2">
            <input type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="border border-gray-400 shadow-2xl p-2 rounded-lg" required />
            <input type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="border border-gray-400 shadow-2xl p-2 rounded-lg" required />
            <select value={newServiceId} onChange={(e) => setNewServiceId(e.target.value)} className="border border-gray-400 shadow-2xl p-2 rounded-lg" required>
              <option value="">Odaberite uslugu</option>
              {services.map((s, idx) => (
                <option key={s.id ?? `temp-${idx}`} value={s.id ?? s.tempId}>{s.name}</option>
              ))}
            </select>
            <button type="submit" className="border border-gray-400 shadow-2xl text-gray-600 px-4 py-2 rounded-lg hover:bg-accentLight transition">Dodaj termin</button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleFinish} className="border border-gray-400 shadow-2xl text-black font-semibold px-10 py-2 rounded-lg hover:bg-gray-600 transition">
          Sačuvaj sve izmene
        </button>
      </div>
    </div>
  );
};

export default CompanyDashboard;
