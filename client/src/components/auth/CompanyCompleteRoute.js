import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";

const CompanyCompleteRoute = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { status, companyComplete } = useContext(CompanyContext);

  if (authLoading || status === "loading") {
    return <div className="text-center mt-10">Učitavanje...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!companyComplete) return <Navigate to="/onboarding/company" replace />;

  return children;
};

export default CompanyCompleteRoute;
