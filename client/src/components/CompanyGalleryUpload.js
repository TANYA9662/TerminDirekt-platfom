import React, { useState, useEffect } from "react";
import API, { setAuthToken } from "../api";

const CompanyGalleryUpload = ({ companyId, onUpdateImages }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [gallery, setGallery] = useState([]);

  const fetchGallery = async () => {
    try {
      const response = await API.get(`/companies/${companyId}/images`);
      setGallery(response.data);
      if (onUpdateImages) onUpdateImages(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (companyId) fetchGallery();
  }, [companyId]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);

    try {
      await API.post(`/companies/${companyId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFiles([]);
      setPreviews([]);
      fetchGallery();
      alert('Upload OK');
    } catch (err) {
      console.error('Upload error', err?.response || err);
      if (err.response?.status === 401) alert('Niste prijavljeni ili nemate dozvolu');
      else alert('Greška pri uploadu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati sliku?')) return;

    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);

    try {
      await API.delete(`/companies/images/${id}`);
      fetchGallery();
    } catch (err) {
      console.error(err);
      alert('Greška pri brisanju');
    }
  };

  return (
    <div className="mt-3">
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {previews.map((p, i) => (
            <img key={i} src={p} alt="" className="h-24 object-cover rounded" />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input type="file" multiple accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} className="bg-primary text-white px-3 py-1 rounded">
          Upload
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {gallery.map(img => (
          <div key={img.id} className="relative">
            <img
              src={`http://localhost:3001${img.image_path}`}
              alt=""
              className="h-24 w-full object-cover rounded"
            />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1 right-1 bg-red-600 text-white px-2 text-xs rounded"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyGalleryUpload;
