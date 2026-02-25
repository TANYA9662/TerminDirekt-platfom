import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { buildImageUrl } from "../../utils/imageUtils";

const CompanyImageUpload = ({ companyId, existingImages = [], onDeleteImage, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("images", file));

      const res = await API.post(`/companies/${companyId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const newImages = res.data.map(img => ({ ...img, url: buildImageUrl(img) }));

      setImages(prev => [...prev, ...newImages]);
      onUploadSuccess && onUploadSuccess(newImages);

      toast.success("Slike uspešno dodate");
    } catch (err) {
      console.error("Greška pri upload-u slika:", err);
      toast.error("Greška pri upload-u slika");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-4"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map(img => (
          <div key={img.id} className="relative">
            <img
              src={buildImageUrl(img)}
              alt="Company"
              className="rounded-lg w-full h-32 object-cover"
            />
            <button
              onClick={() => onDeleteImage(img.id)}
              className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
            >
              Obriši
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyImageUpload;