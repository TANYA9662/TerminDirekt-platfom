import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CompanyImageUpload = ({ companyId, company, onUploadSuccess, onDeleteImage }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFiles(Array.from(e.target.files));

  const uploadImages = async () => {
    if (!files.length || !companyId) return;
    setLoading(true);

    const formData = new FormData();
    files.forEach(f => formData.append("images", f));

    try {
      const res = await API.post(`/companies/${companyId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onUploadSuccess) onUploadSuccess(res.data.images);
      setFiles([]);
      toast.success(t("companyDashboard.images_uploaded"));
    } catch (err) {
      console.error("Upload error:", err.response?.data || err);
      toast.error(t("companyDashboard.error_upload_image"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !onDeleteImage) return;
    try {
      await onDeleteImage(id);
      toast.info(t("companyDashboard.image_deleted"));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(t("companyDashboard.error_delete_image"));
    }
  };

  return (
    <div className="bg-gray-200 p-4 rounded-2xl shadow space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {(company.images || []).map(img => (
          <div
            key={img.id || img.url}
            className="relative w-full overflow-hidden rounded-xl shadow-md ring-1 ring-gray-300"
            style={{ aspectRatio: "4 / 3" }} // sve slike imaju uniformni odnos širina/visina
          >
            <img
              src={img.url || "/uploads/companies/default.png"}
              alt={company.name || t("companyDashboard.company_image")}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              onError={e => { e.target.onerror = null; e.target.src = "/uploads/companies/default.png"; }}
            />
            {!img.isDefault && (
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>


      <input type="file" multiple accept="image/*" onChange={handleChange} className="block w-full text-sm mt-2" />

      <button
        onClick={uploadImages}
        disabled={loading || files.length === 0}
        className="bg-accent text-cardBg px-5 py-2 rounded-xl font-semibold hover:bg-accentLight transition disabled:opacity-50 mt-2"
      >
        {loading ? t("companyDashboard.uploading") : t("upload")}
      </button>
    </div>
  );
};

export default CompanyImageUpload;
