import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import OnboardingLayout from "./components/onboarding/OnboardingLayout";
import CompanyStep from "./components/onboarding/CompanyStep";
import ImagesStep from "./components/onboarding/ImagesStep";
import ServicesStep from "./components/onboarding/ServicesStep";
import OnboardingGuard from "./components/auth/OnboardingGuard";

export default function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  // ⏳ čekamo auth + company
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Učitavanje...</p>
      </div>
    );
  }

  // 🚫 Neregistrovan korisnik
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 🏢 Firma
  if (user.role === "company") {
    const companyComplete =
      user.company &&
      user.company.name?.trim() &&
      user.company.description?.trim() &&
      Array.isArray(user.company.images) &&
      user.company.images.length > 0 &&
      Array.isArray(user.company.services) &&
      user.company.services.length > 0;

    return (
      <Routes>
        {!companyComplete && (
          <Route path="/onboarding/*" element={<OnboardingGuard />}>
            <Route element={<OnboardingLayout />}>
              <Route path="company" element={<CompanyStep />} />
              <Route path="images" element={<ImagesStep />} />
              <Route path="services" element={<ServicesStep />} />
            </Route>
          </Route>
        )}

        {companyComplete && (
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
        )}

        <Route
          path="*"
          element={
            <Navigate
              to={companyComplete ? "/company-dashboard" : "/onboarding/company"}
              replace
            />
          }
        />
      </Routes>
    );
  }

  // 👤 Obični korisnik
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
