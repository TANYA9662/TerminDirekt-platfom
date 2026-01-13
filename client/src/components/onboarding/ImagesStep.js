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
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"));
    if (validFiles.length !== files.length) alert("Dozvoljene su samo slike do 5MB.");

    const previews = validFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
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
    <div className="min-h-screen bg-gray-500 text-white p-6 flex flex-col justify-center max-w-md mx-auto space-y-4 rounded-lg">
      <h3 className="text-xl font-semibold">Dodajte slike</h3>
      {error && <div className="text-red-600">{error}</div>}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={loading}
        className="block mb-2 bg-gray-400 text-white rounded px-2 py-1 w-full"
      />

      <div className="flex flex-wrap gap-2">
        {uploadedImages.map((img, idx) => (
          <div key={`uploaded-${idx}`} className="relative">
            <img
              src={`http://localhost:3001${img.image_path}`}
              alt={`Company ${idx}`}
              className="w-24 h-24 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx, true)}
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
              className="w-24 h-24 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx, false)}
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Nazad
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {loading ? "Čuvanje..." : "Dalje"}
        </button>
      </div>
    </div>
  );
}
