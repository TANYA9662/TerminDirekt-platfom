import React, { useState } from "react";
import API from "../../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const CompanyImageUpload = ({ companyId, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFiles(e.target.files);

  const handleUpload = async () => {
    if (!files.length) return;
    if (!companyId) return alert("ID firme nije dostupan");

    setLoading(true);
    const formData = new FormData();

    Array.from(files).forEach((file) =>
      formData.append("images", file) // MORA "images"
    );

    try {
      const res = await API.post(
        `/companies/${companyId}/images`,
        formData
      );
      onUploadSuccess(res.data.images);
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Greška pri uploadu slika");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 p-4 rounded-2xl shadow space-y-3">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className="bg-accent text-cardBg px-5 py-2 rounded-xl font-semibold hover:bg-accentLight transition disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default CompanyImageUpload;
