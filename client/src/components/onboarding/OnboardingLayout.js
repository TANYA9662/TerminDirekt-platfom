import React, { useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { CompanyContext } from "../../context/CompanyContext";

const steps = ["company", "images", "services"];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { company, status, companyComplete } = useContext(CompanyContext);

  // 🔒 ZAKLJUČAVANJE ONBOARDINGA
  useEffect(() => {
    if (status !== "ready") return;

    if (companyComplete && location.pathname.startsWith("/onboarding")) {
      navigate("/company-dashboard", { replace: true });
    }
  }, [companyComplete, status, location.pathname, navigate]);

  if (status === "loading" || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-500">
        Učitavanje...
      </div>
    );
  }

  // Progress bar logika
  const { name = "", description = "", images = [], services = [] } = company;
  let currentStepIndex = 0;
  if (!name.trim() || !description.trim()) currentStepIndex = 0;
  else if (images.length === 0) currentStepIndex = 1;
  else if (services.length === 0) currentStepIndex = 2;

  return (
    <div className="min-h-screen bg-gray-500 text-white flex flex-col items-center p-6">
      <div className="max-w-3xl w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">Dobrodošli u TerminDirekt</h2>

        <ProgressBar currentStep={currentStepIndex + 1} steps={steps} />

        <div className="p-6 bg-gray-400 rounded-2xl shadow">
          <Outlet context={{ currentStepIndex, steps }} />
        </div>
      </div>
    </div>
  );
}
