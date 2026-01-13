import React, { useState } from "react";
import API, { setAuthToken } from "../../api";

const CompanyImageUpload = ({ companyId, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFiles(e.target.files);

  const handleUpload = async () => {
    if (!files.length) return alert("Izaberite bar jednu sliku");

    setLoading(true);
    const token = localStorage.getItem("token");
    setAuthToken(token);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      const res = await API.post(`/companies/${companyId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(res.data.images);
      setFiles([]);
      alert("Slike uploadovane!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Greška pri uploadu slika");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <input type="file" multiple accept="image/*" onChange={handleChange} />
      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default CompanyImageUpload;
