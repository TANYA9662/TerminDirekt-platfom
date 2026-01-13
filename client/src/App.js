import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CompanyProvider } from "./context/CompanyContext";
import Header from "./components/ui/Header";
import AppRoutes from "./AppRoutes";
import { setAuthToken } from "./api";

if (localStorage.getItem("token")) setAuthToken(localStorage.getItem("token"));

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <BrowserRouter>
          <Header />
          <AppRoutes />
        </BrowserRouter>
      </CompanyProvider>
    </AuthProvider>
  );
}
