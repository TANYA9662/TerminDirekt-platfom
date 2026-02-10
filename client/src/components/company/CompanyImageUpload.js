import React, { useState } from "react";
import API from "../../api";
import { mapCompanyImages } from "../../utils/imageUtils";

const CompanyImageUpload = ({ companyId, company, setCompany }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFiles(Array.from(e.target.files));
  };

  //  UPLOAD
  const uploadImages = async () => {
    if (!files.length || !companyId) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach(f => formData.append("images", f));

    try {
      const res = await API.post(
        `/companies/${companyId}/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setCompany(prev => ({
        ...prev,
        images: mapCompanyImages([
          ...prev.images.filter(i => !i.isDefault),
          ...res.data.images,
        ]),
      }));

      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Greška pri uploadu slika");
    } finally {
      setLoading(false);
    }
  };

  //  DELETE 
  const deleteImage = async (imageId) => {
    try {
      // poziv backend-a koji briše i iz Cloudinary i iz baze
      await API.delete(`/companies/images/${imageId}`);

      // update frontend state nakon uspešnog brisanja
      setCompany(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId),
      }));
    } catch (err) {
      console.error(err);
      alert("Greška pri brisanju slike");
    }
  };


  return (
    <div className="bg-gray-200 p-4 rounded-2xl shadow space-y-4">
      {/* PREVIEW */}
      <div className="grid grid-cols-3 gap-3">
        {company.images.map(img => (
          <div key={img.id || img.url} className="relative group">
            <img
              src={img.url}
              alt="company"
              className="w-full h-28 object-cover rounded-xl"
            />

            {!img.isDefault && (
              <button
                onClick={() => deleteImage(img.id)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* UPLOAD */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm"
      />

      <button
        onClick={uploadImages}
        disabled={loading || files.length === 0}
        className="bg-accent text-cardBg px-5 py-2 rounded-xl font-semibold hover:bg-accentLight transition disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default CompanyImageUpload;
