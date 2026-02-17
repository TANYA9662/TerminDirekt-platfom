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

  if (status === "loading") return <div className="p-6 text-center">Učitavanje firme...</div>;

  // if company complete → go to dashboard
  if (companyComplete) return <Navigate to="/company-dashboard" replace />;

  // go to next onboarding step
  let nextStep = "/onboarding/company";
  if (company?.name && company?.description && !company.images?.length) nextStep = "/onboarding/images";
  else if (company?.name && company?.description && company.images?.length && !company.services?.length)
    nextStep = "/onboarding/services";

  if (location.pathname !== nextStep) return <Navigate to={nextStep} replace />;

  return <Outlet />;
}
