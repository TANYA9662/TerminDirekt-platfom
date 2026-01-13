import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CompanyContext } from "../../context/CompanyContext";
import Button from "./Button";

const Header = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const { company, companyComplete, status: companyStatus } = useContext(CompanyContext);
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (!user) return navigate("/login");
    if (authLoading || companyStatus === "loading") return;

    if (user.role === "company") {
      if (!company || !companyComplete) navigate("/onboarding/company");
      else navigate("/company-dashboard");
    } else {
      navigate("/");
    }
  };

  console.log("AuthContext:", AuthContext);
  console.log("CompanyContext:", CompanyContext);

  return (
    <header className="sticky top-0 z-50 bg-secondary text-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={user?.role === "company" ? (companyComplete ? "/company-dashboard" : "/onboarding/company") : "/"}
          className="text-2xl font-bold"
        >
          TerminDirekt
        </Link>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAccountClick}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Moj nalog
          </Button>

          {user && (
            <Button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Odjava
            </Button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
