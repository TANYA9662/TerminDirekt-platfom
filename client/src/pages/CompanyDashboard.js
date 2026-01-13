import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyContext } from "../context/CompanyContext";
import CompanyImageUpload from "../components/company/CompanyImageUpload";
import API from "../api";

const CompanyDashboard = () => {
  const { company, updateCompany } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);

  const [editName, setEditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [tempName, setTempName] = useState(company?.name || "");
  const [tempDescription, setTempDescription] = useState(company?.description || "");

  const [services, setServices] = useState(company?.services || []);
  const [slots, setSlots] = useState(company?.slots || []);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  useEffect(() => {
    setTempName(company?.name || "");
    setTempDescription(company?.description || "");
    setServices(company?.services || []);
    setSlots(company?.slots || []);
  }, [company]);

  if (!company) return <div className="p-6 text-center text-white">Firma nije pronađena.</div>;

  // -------------------- IMAGE HANDLERS --------------------
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + company.images.length) % company.images.length);
  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % company.images.length);

  const handleUploadSuccess = async (newImages) => {
    await updateCompany({ ...company, images: newImages });
    setCurrentImage(0);
  };

  const handleDeleteImage = async (index) => {
    if (!window.confirm("Obrisati sliku?")) return;
    try {
      const imageId = company.images[index].id;
      await API.delete(`/companies/images/${imageId}`);
      const updatedImages = company.images.filter((_, i) => i !== index);
      await updateCompany({ ...company, images: updatedImages });
      setCurrentImage(0);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Greška pri brisanju slike");
    }
  };

  // -------------------- SERVICES --------------------
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return alert("Unesite naziv i cenu usluge");

    const updated = [...services, { name: newServiceName, price: Number(newServicePrice) }];
    setServices(updated);
    setNewServiceName("");
    setNewServicePrice("");
    await updateCompany({ ...company, services: updated });
  };

  const handleDeleteService = async (idx) => {
    const updated = services.filter((_, i) => i !== idx);
    setServices(updated);
    await updateCompany({ ...company, services: updated });
  };

  // -------------------- SLOTS --------------------
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newStart || !newEnd) return alert("Unesite početak i kraj termina");

    const startISO = new Date(newStart).toISOString();
    const endISO = new Date(newEnd).toISOString();

    const updated = [...slots, { start_time: startISO, end_time: endISO }];
    setSlots(updated);
    setNewStart("");
    setNewEnd("");

    try {
      await updateCompany({ ...company, slots: updated });
    } catch (err) {
      console.error("Greška pri dodavanju termina:", err.response?.data || err);
      alert(err.response?.data?.message || "Greška pri dodavanju termina");
    }
  };

  const handleDeleteSlot = async (idx) => {
    const updated = slots.filter((_, i) => i !== idx);
    setSlots(updated);
    await updateCompany({ ...company, slots: updated });
  };

  // -------------------- ZAVRŠI DUGME --------------------
  const handleFinish = async () => {
    try {
      // Sačuvaj sve podatke pre navigacije
      await updateCompany({ ...company, slots, services, images: company.images });
      navigate("/profile");
    } catch (err) {
      console.error("Greška pri završavanju:", err.response?.data || err);
      alert(err.response?.data?.message || "Greška pri završavanju");
    }
  };

  // -------------------- RENDER --------------------
  return (
    <div className="min-h-screen bg-gray-500 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* NAME / DESCRIPTION */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {editName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={async () => {
                  await updateCompany({ ...company, name: tempName });
                  setEditName(false);
                }}
                className="border-b border-gray-300 bg-gray-400 text-white px-2 py-1 focus:outline-none"
                autoFocus
              />
            ) : (
              <span onClick={() => setEditName(true)} className="cursor-pointer hover:underline">
                {company.name || "Dodajte naziv firme"}
              </span>
            )}
          </h1>
          <p className="text-gray-100">
            {editDescription ? (
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onBlur={async () => {
                  await updateCompany({ ...company, description: tempDescription });
                  setEditDescription(false);
                }}
                className="w-full max-w-md bg-gray-400 border border-gray-300 rounded p-2 text-white focus:outline-none"
                rows={3}
                autoFocus
              />
            ) : (
              <span onClick={() => setEditDescription(true)} className="cursor-pointer hover:underline">
                {company.description || "Dodajte opis firme"}
              </span>
            )}
          </p>
        </div>

        {/* IMAGES */}
        <div className="space-y-4 bg-gray-400 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Slike firme</h2>
          {company.images?.length > 0 ? (
            <div className="space-y-2">
              <div className="relative w-full max-w-3xl h-64 mx-auto overflow-hidden rounded-lg shadow-lg">
                <img
                  src={`http://localhost:3001${company.images[currentImage].image_path}`}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                {company.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-gray-700 transition"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-gray-700 transition"
                    >
                      ›
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteImage(currentImage)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Obriši
                </button>
              </div>

              <div className="flex justify-center gap-2 overflow-x-auto">
                {company.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:3001${img.image_path}`}
                    alt={`Thumb ${idx}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${idx === currentImage ? "border-red-600" : "border-transparent"}`}
                    onClick={() => setCurrentImage(idx)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-500 flex items-center justify-center rounded-lg mb-4">
              Nema slika
            </div>
          )}
          <CompanyImageUpload companyId={company.id} onUpload={handleUploadSuccess} />
        </div>

        {/* SERVICES */}
        <div className="space-y-4 bg-gray-400 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Usluge i cene</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.length > 0 ? services.map((s, idx) => (
              <div key={idx} className="p-4 bg-gray-500 rounded flex justify-between items-center">
                <span>{s.name} – {s.price} RSD</span>
                <button
                  onClick={() => handleDeleteService(idx)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                >
                  Obriši
                </button>
              </div>
            )) : <p className="text-gray-100 col-span-full">Nema unetih usluga</p>}
          </div>
          <form onSubmit={handleAddService} className="mt-2 flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Naziv usluge"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="bg-gray-500 border border-gray-300 px-2 py-1 rounded text-white focus:outline-none flex-1"
            />
            <input
              type="number"
              placeholder="Cena"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              className="bg-gray-500 border border-gray-300 px-2 py-1 rounded text-white focus:outline-none w-32"
            />
            <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
              Dodaj
            </button>
          </form>
        </div>

        {/* SLOTS */}
        <div className="space-y-4 bg-gray-400 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Termini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slots.length > 0 ? slots.map((s, idx) => (
              <div key={idx} className="p-4 bg-gray-500 rounded flex justify-between items-center">
                <span>{new Date(s.start_time).toLocaleDateString()} {new Date(s.start_time).toLocaleTimeString()} – {new Date(s.end_time).toLocaleTimeString()}</span>
                <button
                  onClick={() => handleDeleteSlot(idx)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                >
                  Obriši
                </button>
              </div>
            )) : <p className="text-gray-100 col-span-full">Nema unetih termina</p>}
          </div>
          <form onSubmit={handleAddSlot} className="mt-2 flex gap-2 flex-wrap">
            <input
              type="datetime-local"
              value={newStart}
              onChange={e => setNewStart(e.target.value)}
              className="bg-gray-500 border border-gray-300 px-2 py-1 rounded text-white focus:outline-none"
            />
            <input
              type="datetime-local"
              value={newEnd}
              onChange={e => setNewEnd(e.target.value)}
              className="bg-gray-500 border border-gray-300 px-2 py-1 rounded text-white focus:outline-none"
            />
            <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
              Dodaj termin
            </button>
          </form>
        </div>

        {/* ZAVRŠI DUGME */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleFinish}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Završi
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompanyDashboard;
