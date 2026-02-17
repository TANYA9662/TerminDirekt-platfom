import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

import ServiceList from "../components/company/ServiceList";
import BookingModal from "../components/modals/BookingModal";
import Reviews from "../components/company/Reviews";
import HeroCompany from "../components/company/HeroCompany";
import CompanyImages from "../components/company/CompanyImages";

import { mapCompanyImages } from "../utils/imageUtils";
import { useTranslation } from "react-i18next";

/* ================= MULTI LANGUAGE HELPER ================= */
const getTranslated = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.sr || field.en || field.sv || "";
  return "";
};

/* ================= STARS COMPONENT ================= */
const Stars = ({ rating, t }) => {
  if (!rating) return <span className="text-sm text-gray-400">{t("companyCard.no_reviews")}</span>;

  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1 text-yellow-400 text-sm">
      {[...Array(5)].map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i} className="text-gray-300">★</span>;
      })}
    </div>
  );
};

const CompanyDetail = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

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
  }, [id, lang]);

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [cRes, imgsRes, svcRes, revRes] = await Promise.allSettled([
        API.get(`/companies/${id}?lang=${lang}`),
        API.get(`/companies/${id}/images`),
        API.get(`/companies/${id}/services?lang=${lang}`),
        API.get(`/companies/${id}/reviews`)
      ]);

      if (cRes.status === "fulfilled") setCompany(cRes.value.data);
      if (imgsRes.status === "fulfilled") setImages(mapCompanyImages(imgsRes.value.data || []));
      if (svcRes.status === "fulfilled") setServices(svcRes.value.data || []);
      if (revRes.status === "fulfilled") setReviews(revRes.value.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingCreated = () => {
    setBookingOpen(false);
    navigate("/dashboard");
  };

  const prevImage = () => {
    if (!images.length) return;
    setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    if (!images.length) return;
    setCarouselIndex((prev) => (prev + 1) % images.length);
  };

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700 text-lg">
        {t("companyDetail.not_found")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white ring-1 ring-gray-200 p-6 max-w-6xl mx-auto space-y-6">

      <CompanyImages
        images={images}
        carouselIndex={carouselIndex}
        prevImage={prevImage}
        nextImage={nextImage}
        companyName={getTranslated(company.name, lang)}
        className="rounded-2xl shadow-md bg-gray-200"
      />

      <HeroCompany
        company={company}
        onBookingClick={() => setBookingOpen(true)}
      />

      <div className="bg-gray-50 p-6 rounded-2xl shadow space-y-8">

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {getTranslated(company.translations?.services_title, lang) || t("companyDetail.services")}
          </h2>
          <ServiceList services={services} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {getTranslated(company.translations?.reviews_title, lang) || t("companyDetail.reviews")}
          </h2>
          <Reviews
            reviews={reviews}
            companyId={id}
            onNewReview={fetchAll}
            t={t}  // opcionalno ako Reviews koristi tekst
          />
        </div>

      </div>

      {bookingOpen && (
        <BookingModal
          company={{
            ...company,
            services,
            slots: company.slots || []
          }}
          onClose={() => setBookingOpen(false)}
          onSubmit={handleBookingCreated}
        />
      )}

    </div>
  );
};

export default CompanyDetail;
