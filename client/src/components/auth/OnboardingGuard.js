import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import React from "react";

import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

export default function OnboardingGuard() {
  const { user } = useContext(AuthContext);
  const { companyComplete, status, company } = useContext(CompanyContext);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "company") return <Navigate to="/" replace />;

  if (status === "loading") {
    return <div className="p-6 text-center">Učitavanje firme...</div>;
  }

  // Ako je onboarding kompletan
  if (companyComplete) {
    if (location.pathname !== "/company-dashboard") {
      return <Navigate to="/company-dashboard" replace />;
    }
    return <Outlet />;
  }

  // Odredi sledeći korak onboarding-a
  let nextStep = "/onboarding/company";

  if (company?.name && company?.description) {
    if (!company?.images?.length) {
      nextStep = "/onboarding/images";
    } else if (!company?.services?.length) {
      nextStep = "/onboarding/services";
    }
  }

  // Redirect samo ako trenutno nismo na sledećem koraku
  if (location.pathname !== nextStep) {
    return <Navigate to={nextStep} replace />;
  }

  return <Outlet />;
}