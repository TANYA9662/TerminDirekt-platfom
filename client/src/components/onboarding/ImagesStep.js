import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";
import API from "../../api";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ImagesStep() {
  const { t } = useTranslation();
  const { currentStepIndex, steps } = useOutletContext();
  const { company, setCompany } = useContext(CompanyContext);
  const navigate = useNavigate();

  const [uploadedImages, setUploadedImages] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(company?.images)) setUploadedImages(company.images);
  }, [company]);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files);
    const valid = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (!valid.length) return toast.error(t("onboarding.image_limit"));

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
    if (!localFiles.length && !uploadedImages.length) {
      return toast.error(t("onboarding.add_at_least_one_image"));
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
        toast.success(t("onboarding.images_saved"));
      }

      navigate(`/onboarding/${steps[currentStepIndex + 1]}`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || err.message || t("onboarding.error_saving_images"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(`/onboarding/${steps[currentStepIndex - 1]}`);

  return (
    <div className="min-h-screen bg-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white p-6 rounded-3xl shadow-md space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">{t("onboarding.add_images")}</h3>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <div className="flex gap-4 overflow-x-auto py-2">
            {uploadedImages.map((img, idx) => (
              <div key={`uploaded-${idx}`} className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={`http://localhost:3001${img.image_path}`}
                  alt={`${t("onboarding.company")} ${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx, true)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            {localFiles.map((img, idx) => (
              <div key={`local-${idx}`} className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={img.preview}
                  alt={`${t("onboarding.company")} ${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx, false)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition"
            >
              {t("onboarding.back")}
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 transition"}`}
            >
              {loading ? t("onboarding.saving") : t("onboarding.next")}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
