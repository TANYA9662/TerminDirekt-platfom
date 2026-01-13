import React, { useState } from "react";

const CompanyGallery = ({ images = [], companyName }) => {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const urls = images.map(img => {
    const p = img.image_path || img;
    return p.startsWith("http") ? p : `http://localhost:3001${p}`;
  });

  const openAt = (i) => { setIdx(i); setOpen(true); };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {urls.slice(0, 6).map((u, i) => (
          <button key={i} onClick={() => openAt(i)} className="overflow-hidden rounded-lg">
            <img src={u} alt={`${companyName} ${i}`} className="w-full h-40 object-cover hover:scale-105 transition" />
          </button>
        ))}
        {urls.length === 0 && (
          <div className="col-span-3 h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            Nema slika
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="relative w-full max-w-4xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white text-2xl">✕</button>

            <div className="flex items-center gap-4">
              <button onClick={() => setIdx((idx - 1 + urls.length) % urls.length)} className="text-white text-3xl p-2">‹</button>
              <div className="flex-1">
                <img src={urls[idx]} alt={`${companyName} big`} className="w-full max-h-[70vh] object-contain mx-auto" />
              </div>
              <button onClick={() => setIdx((idx + 1) % urls.length)} className="text-white text-3xl p-2">›</button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto">
              {urls.map((u, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`w-20 h-16 overflow-hidden rounded ${i === idx ? "ring-2 ring-white" : ""}`}>
                  <img src={u} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyGallery;
