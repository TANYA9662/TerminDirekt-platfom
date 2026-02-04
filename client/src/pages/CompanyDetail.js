import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import ServiceList from "../components/company/ServiceList";
import BookingModal from "../components/modals/BookingModal";
import Reviews from "../components/company/Reviews";
import HeroCompany from "../components/company/HeroCompany";
import CompanyImages from "../components/company/CompanyImages";

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [images, setImages] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, imgsRes, svcRes, revRes] = await Promise.allSettled([
        API.get(`/companies/${id}`),
        API.get(`/companies/${id}/images`),
        API.get(`/companies/${id}/services`),
        API.get(`/companies/${id}/reviews`),
      ]);
      if (cRes.status === "fulfilled") setCompany(cRes.value.data);
      if (imgsRes.status === "fulfilled") setImages(imgsRes.value.data || []);
      if (svcRes.status === "fulfilled") setServices(svcRes.value.data || []);
      if (revRes.status === "fulfilled") setReviews(revRes.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingCreated = () => {
    setBookingOpen(false);
    navigate("/dashboard");
  };

  const prevImage = () =>
    setCarouselIndex((p) => (p - 1 + images.length) % images.length);
  const nextImage = () =>
    setCarouselIndex((p) => (p + 1) % images.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 max-w-6xl mx-auto animate-pulse space-y-4">
        <div className="h-64 bg-gray-300 rounded-2xl" />
        <div className="h-6 bg-gray-300 rounded w-1/2" />
        <div className="h-4 bg-gray-300 rounded w-1/3" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-textDark">
        Firma nije pronađena.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-6xl mx-auto space-y-6">
      <CompanyImages
        images={images}
        carouselIndex={carouselIndex}
        prevImage={prevImage}
        nextImage={nextImage}
        companyName={company?.name || "Nepoznata firma"}
        className="rounded-2xl shadow-md bg-gray-200"
      />

      <HeroCompany
        company={company}
        onBookingClick={() => setBookingOpen(true)}
      />

      <div className="bg-gray-200 p-6 rounded-2xl shadow space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-textDark">
            Usluge i cene
          </h2>
          <ServiceList services={services} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-textDark">
            Recenzije
          </h2>
          <Reviews reviews={reviews} companyId={id} onNewReview={fetchAll} />
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          company={company}
          services={services}
          slots={company.slots || []}
          onClose={() => setBookingOpen(false)}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
};

export default CompanyDetail;
