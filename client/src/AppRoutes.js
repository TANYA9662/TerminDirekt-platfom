import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { CompanyContext } from "./context/CompanyContext";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import CompanyPage from "./pages/CompanyPage";
import Dashboard from "./pages/Dashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ResetPasswordRequest from "./components/auth/ResetPasswordRequest";
import ResetPassword from "./components/auth/ResetPassword";

import OnboardingLayout from "./components/onboarding/OnboardingLayout";
import CompanyStep from "./components/onboarding/CompanyStep";
import ImagesStep from "./components/onboarding/ImagesStep";
import ServicesStep from "./components/onboarding/ServicesStep";
import OnboardingGuard from "./components/auth/OnboardingGuard";

export default function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const { company, status } = useContext(CompanyContext);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Učitavanje...</p>
      </div>
    );
  }

  // Funkcija koja određuje sledeći onboarding step
  const getNextOnboardingStep = (company) => {
    if (!company?.name?.trim() || !company?.description?.trim()) return "company";
    if (!Array.isArray(company.images) || company.images.length === 0) return "images";
    if (!Array.isArray(company.services) || company.services.length === 0) return "services";
    return null;
  };

  // 🚫 Guest
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/companies/:id" element={<CompanyPage />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Firma
  if (user.role === "company") {
    const nextStep = getNextOnboardingStep(company);
    const finalCompanyComplete = nextStep === null;

    return (
      <Routes>
        {/* Onboarding ako firma nije kompletna */}
        {!finalCompanyComplete && (
          <Route path="/onboarding/*" element={<OnboardingGuard />}>
            <Route element={<OnboardingLayout />}>
              <Route path="company" element={<CompanyStep />} />
              <Route path="images" element={<ImagesStep />} />
              <Route path="services" element={<ServicesStep />} />
            </Route>
          </Route>
        )}

        {/* Firma kompletna */}
        {finalCompanyComplete && (
          <>
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/companies/:id" element={<CompanyPage />} />
          </>
        )}

        {/* Redirect */}
        <Route
          path="*"
          element={
            <Navigate
              to={finalCompanyComplete ? "/company-dashboard" : `/onboarding/${nextStep}`}
              replace
            />
          }
        />
      </Routes>
    );
  }

  // Obični korisnik
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/companies/:id" element={<CompanyPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
