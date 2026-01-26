import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";
import API from "../../api";

export default function ImagesStep() {
  const { currentStepIndex, steps } = useOutletContext();
  const { company, setCompany } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [uploadedImages, setUploadedImages] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(company?.images)) setUploadedImages(company.images);
  }, [company]);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files);
    const valid = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (!valid.length) return alert("Dozvoljene su slike do 5MB");
    const previews = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setLocalFiles(prev => [...prev, ...previews]);
  };

  const handleRemove = (idx, isUploaded = false) => {
    if (isUploaded) {
      const updated = uploadedImages.filter((_, i) => i !== idx);
      setUploadedImages(updated);
      setCompany(prev => ({ ...prev, images: updated }));
    } else {
      setLocalFiles(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleNext = async () => {
    setError("");

    if (!localFiles.length && !uploadedImages.length) {
      setError("Molimo dodajte bar jednu sliku.");
      return;
    }

    setLoading(true);

    try {
      if (localFiles.length > 0) {
        const formData = new FormData();
        localFiles.forEach(img => formData.append("images", img.file));

        const res = await API.post(
          `/companies/${company.id}/images`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        setUploadedImages(res.data.images);
        setCompany(prev => ({ ...prev, images: res.data.images }));
        setLocalFiles([]);
      }

      navigate(`/onboarding/${steps[currentStepIndex + 1]}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || err.message || "Greška pri čuvanju slika.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(`/onboarding/${steps[currentStepIndex - 1]}`);

  return (
    <div className="min-h-screen bg-gray-200 p-6 flex flex-col justify-center max-w-md mx-auto space-y-4 rounded-2xl shadow">
      <h3 className="text-xl font-semibold text-gray-800">Dodajte slike</h3>
      {error && <div className="text-red-600">{error}</div>}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={loading}
        className="w-full px-3 py-2 rounded-lg bg-gray-200 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
      />

      <div className="flex flex-wrap gap-2">
        {uploadedImages.map((img, idx) => (
          <div key={`uploaded-${idx}`} className="relative">
            <img
              src={`http://localhost:3001${img.image_path}`}
              alt={`Company ${idx}`}
              className="w-24 h-24 object-cover rounded-lg shadow"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx, true)}
              className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
        {localFiles.map((img, idx) => (
          <div key={`local-${idx}`} className="relative">
            <img
              src={img.preview}
              alt={`Company ${idx}`}
              className="w-24 h-24 object-cover rounded-lg shadow"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx, false)}
              className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handleBack}
          disabled={loading}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Nazad
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
        >
          {loading ? "Čuvanje..." : "Dalje"}
        </button>
      </div>
    </div>
  );
}
