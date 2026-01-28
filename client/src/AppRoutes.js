import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { CompanyContext } from "./context/CompanyContext";
import CategoryPage from "./pages/CategoryPage";




import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import Login from "./components/auth/Login";
import ResetPasswordRequest from "./components/auth/ResetPasswordRequest";
import ResetPassword from "./components/auth/ResetPassword";
import Register from "./components/auth/Register";

import OnboardingLayout from "./components/onboarding/OnboardingLayout";
import CompanyStep from "./components/onboarding/CompanyStep";
import ImagesStep from "./components/onboarding/ImagesStep";
import ServicesStep from "./components/onboarding/ServicesStep";
import OnboardingGuard from "./components/auth/OnboardingGuard";

export default function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const { companyComplete: contextComplete, status } = useContext(CompanyContext);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Učitavanje...</p>
      </div>
    );
  }

  // 🚫 Guest
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 🏢 Firma
  if (user.role === "company") {
    const oldCompanyComplete =
      user.company &&
      user.company.name?.trim() &&
      user.company.description?.trim() &&
      Array.isArray(user.company.images) &&
      user.company.images.length > 0 &&
      Array.isArray(user.company.services) &&
      user.company.services.length > 0;

    const finalCompanyComplete = oldCompanyComplete || contextComplete;

    return (
      <Routes>
        {!finalCompanyComplete && (
          <Route path="/onboarding/*" element={<OnboardingGuard />}>
            <Route element={<OnboardingLayout />}>
              <Route path="company" element={<CompanyStep />} />
              <Route path="images" element={<ImagesStep />} />
              <Route path="services" element={<ServicesStep />} />
            </Route>
          </Route>
        )}

        {finalCompanyComplete && (
          <>
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/category/:id" element={<CategoryPage />} />
          </>
        )}

        <Route
          path="*"
          element={
            <Navigate
              to={finalCompanyComplete ? "/company-dashboard" : "/onboarding/company"}
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
      <Route path="/" element={<Home />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
