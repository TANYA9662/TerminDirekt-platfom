import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { buildImageUrl } from "../../utils/imageUtils";


const CompanyImageUpload = ({ companyId, existingImages = [], onDeleteImage, onUploadSuccess, square = false }) => {
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

      const newImages = res.data.map(img => ({
        ...img,
        url: buildImageUrl(img, square ? 1200 : 400) // veće samo ako square=true
      }));

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
      <div className={`grid gap-6 ${square ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"}`}>
        {images.map(img => (
          <div key={img.id} className="relative w-full overflow-hidden rounded-lg shadow-lg">
            <img
              src={img.url}
              alt="Company"
              className={`${square ? "w-full aspect-square" : "h-32 w-full"} object-cover transition-transform duration-500 hover:scale-110`}
            />
            <button
              onClick={() => onDeleteImage(img.id)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
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