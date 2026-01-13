import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

export default function OnboardingGuard() {
  const { user } = useContext(AuthContext);
  const { companyComplete, status, company } = useContext(CompanyContext);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "company") return <Navigate to="/" replace />;

  if (status === "loading") return <div className="p-6 text-center">Učitavanje firme...</div>;

  // Ako je firma kompletna → idi na dashboard
  if (companyComplete) return <Navigate to="/company-dashboard" replace />;

  // Odredi sledeći onboarding korak
  let nextStep = "/onboarding/company";
  if (company?.name && company?.description && !company.images?.length) nextStep = "/onboarding/images";
  else if (company?.name && company?.description && company.images?.length && !company.services?.length)
    nextStep = "/onboarding/services";

  if (location.pathname !== nextStep) return <Navigate to={nextStep} replace />;

  return <Outlet />;
}
