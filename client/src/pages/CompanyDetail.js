import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import ServiceList from "../components/company/ServiceList";
import BookingModal from "../components/company/BookingModal";
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingCreated = () => {
    setBookingOpen(false);
    alert("Rezervacija poslana!");
    navigate("/dashboard");
  };

  const prevImage = () => setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setCarouselIndex((prev) => (prev + 1) % images.length);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-pulse space-y-4 bg-gray-500 text-white min-h-screen">
        <div className="h-64 bg-gray-400 rounded-lg"></div>
        <div className="h-6 bg-gray-400 rounded w-1/2"></div>
        <div className="h-4 bg-gray-400 rounded w-1/3"></div>
        <div className="h-32 bg-gray-400 rounded-lg"></div>
      </div>
    );
  }

  if (!company)
    return (
      <div className="p-8 text-center text-white bg-gray-500 min-h-screen">
        Firma nije pronađena.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-500 text-white p-6 max-w-6xl mx-auto space-y-6">
      <CompanyImages
        images={images}
        carouselIndex={carouselIndex}
        prevImage={prevImage}
        nextImage={nextImage}
        companyName={company.name}
      />
      <HeroCompany company={company} onBookingClick={() => setBookingOpen(true)} />

      <div className="bg-gray-400 p-6 rounded-lg shadow space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Usluge i cene</h2>
          <ServiceList services={services} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Recenzije</h2>
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
