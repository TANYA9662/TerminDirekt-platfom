import React, { createContext, useState, useEffect, useContext } from "react";
import API, { setAuthToken } from "../api";
import { AuthContext } from "./AuthContext";

export const CompanyContext = createContext();

const emptyCompany = {
  id: null,
  name: "",
  description: "",
  images: [],
  services: [],
  slots: [],
  user_id: null,
};

// Funkcija koja proverava da li je company kompletna
const isCompanyComplete = (company) => {
  return Boolean(
    company &&
    company.id &&
    company.name?.trim() &&
    Array.isArray(company.images) &&
    company.images.length > 0 &&
    Array.isArray(company.services) &&
    company.services.length > 0
  );
};

export const CompanyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [company, setCompany] = useState(emptyCompany);
  const [status, setStatus] = useState("loading"); // loading | ready
  const [companyComplete, setCompanyComplete] = useState(false);

  // Fetch company za ulogovanog korisnika
  useEffect(() => {
    // Nema usera ili nije company
    if (!user || user.role !== "company") {
      setCompany(emptyCompany);
      setCompanyComplete(false);
      setStatus("ready");
      return;
    }

    // ✅ AKO VEĆ IMAMO COMPANY IZ AUTH CONTEXT-A — KORISTI NJU
    if (user.company && user.company.id) {
      const fullCompany = {
        ...emptyCompany,
        ...user.company,
        images: Array.isArray(user.company.images) ? user.company.images : [],
        services: Array.isArray(user.company.services) ? user.company.services : [],
        slots: Array.isArray(user.company.slots) ? user.company.slots : [],
        user_id: user.company.user_id ?? user.id,
      };

      setCompany(fullCompany);
      setCompanyComplete(isCompanyComplete(fullCompany));
      setStatus("ready");
      return;
    }

    // ⬇️ FETCHUJ SAMO AKO NEMA COMPANY U AUTH CONTEXT-U
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) setAuthToken(token);

        const res = await API.get(`/companies/user/${user.id}/details`);
        const companyData = res.data ?? emptyCompany;

        const fullCompany = {
          ...emptyCompany,
          ...companyData,
          images: Array.isArray(companyData.images) ? companyData.images : [],
          services: Array.isArray(companyData.services) ? companyData.services : [],
          slots: Array.isArray(companyData.slots) ? companyData.slots : [],
          user_id: companyData.user_id ?? user.id,
        };

        setCompany(fullCompany);
        setCompanyComplete(isCompanyComplete(fullCompany));
      } catch (err) {
        console.error("Company fetch error:", err);
        setCompany(emptyCompany);
        setCompanyComplete(false);
      } finally {
        setStatus("ready");
      }
    };

    fetchCompany();
  }, [user]);

  // Funkcija za update ili upsert company
  const updateCompany = async (data, config = {}) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Korisnik nije ulogovan");

      const headers = { Authorization: `Bearer ${token}` };
      let updatedCompany;

      if (data instanceof FormData) {
        const res = await API.post("/companies", data, { headers });
        updatedCompany = { ...company, ...res.data.company };
      } else {
        const payload = {
          ...data,
          id: data.id ?? company?.id,
          userId: data.userId ?? company?.user_id ?? user.id,
        };

        if (payload.services && !Array.isArray(payload.services)) {
          payload.services = JSON.stringify(payload.services);
        }

        const res = await API.post("/companies", payload, {
          headers,
          ...config,
        });

        updatedCompany = { ...company, ...res.data.company };
      }

      const fullCompany = {
        ...emptyCompany,
        ...updatedCompany,
        images: Array.isArray(updatedCompany.images) ? updatedCompany.images : [],
        services: Array.isArray(updatedCompany.services) ? updatedCompany.services : [],
        slots: Array.isArray(updatedCompany.slots) ? updatedCompany.slots : [],
        user_id: updatedCompany.user_id ?? user.id,
      };

      setCompany(fullCompany);
      setCompanyComplete(isCompanyComplete(fullCompany));

      return fullCompany;
    } catch (err) {
      console.error("Company update error:", err);
      throw err;
    }
  };

  return (
    <CompanyContext.Provider
      value={{ company, setCompany, companyComplete, status, updateCompany }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
