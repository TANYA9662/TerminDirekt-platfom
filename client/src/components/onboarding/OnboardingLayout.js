import React, { useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CompanyContext } from "../../context/CompanyContext";
import ProgressBar from "./ProgressBar";
import { useTranslation } from "react-i18next";

const steps = ["company", "images", "services"];

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { company, status } = useContext(CompanyContext);

  // Automatska navigacija ako je onboarding završen
  useEffect(() => {
    if (status !== "ready" || !company) return;

    const isComplete =
      company?.name?.trim() &&
      company?.description?.trim() &&
      Array.isArray(company.images) && company.images.length > 0 &&
      Array.isArray(company.services) && company.services.length > 0;

    if (isComplete && location.pathname.startsWith("/onboarding")) {
      navigate("/company-dashboard", { replace: true });
    }
  }, [company, status, location.pathname, navigate]);

  // Loading state
  if (status === "loading" || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-800 bg-gray-200">
        {t("onboarding.loading")}
      </div>
    );
  }

  // Fallback vrednosti
  const nameSafe = company?.name ?? "";
  const descriptionSafe = company?.description ?? "";
  const imagesSafe = Array.isArray(company?.images) ? company.images : [];
  const servicesSafe = Array.isArray(company?.services) ? company.services : [];

  // Odredi trenutni onboarding step
  let currentStepIndex = 0;
  if (!nameSafe.trim() || !descriptionSafe.trim()) currentStepIndex = 0;
  else if (imagesSafe.length === 0) currentStepIndex = 1;
  else if (servicesSafe.length === 0) currentStepIndex = 2;

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center p-14">
      <div className="max-w-3xl w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {t("onboarding.welcome")}
        </h2>

        <ProgressBar currentStep={currentStepIndex + 1} steps={steps} />

        <div className="p-9 bg-gray-300 rounded-2xl shadow-lg">
          <Outlet context={{ currentStepIndex, steps }} />
        </div>
      </div>
    </div>
  );
}
