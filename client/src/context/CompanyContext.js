import React, { createContext, useState, useEffect, useContext } from "react";
import API, { setAuthToken } from "../api";
import { AuthContext } from "./AuthContext";

export const CompanyContext = createContext();

const emptyCompany = {
  id: null,
  name: "",
  city: "",
  description: "",
  images: [],
  services: [],
  slots: [],
  user_id: null,
};

const isCompanyComplete = (company) =>
  Boolean(
    company?.id &&
    company.name?.trim() &&
    company.description?.trim() &&
    Array.isArray(company.images) &&
    company.images.length > 0 &&
    Array.isArray(company.services) &&
    company.services.length > 0
  );

export const CompanyProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  const [company, setCompany] = useState(emptyCompany);
  const [status, setStatus] = useState("loading");
  const [companyComplete, setCompanyComplete] = useState(false);

  /* ================= FETCH COMPANY ================= */
  const fetchCompany = async () => {
    setStatus("loading");
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);

      const res = await API.get("/companies/me");
      const data = res.data ?? {};

      const normalized = {
        ...emptyCompany,
        ...data,
        images: Array.isArray(data.images) ? data.images : [],
        services: Array.isArray(data.services) ? data.services : [],
        slots: Array.isArray(data.slots) ? data.slots : [],
      };

      setCompany(normalized);
      setCompanyComplete(isCompanyComplete(normalized));
    } catch (err) {
      console.error("Greška pri fetchu firme:", err);
      setCompany(emptyCompany);
      setCompanyComplete(false);
    } finally {
      setStatus("ready");
    }
  };

  useEffect(() => {
    if (!user || user.role !== "company" || loading) {
      setCompany(emptyCompany);
      setCompanyComplete(false);
      setStatus("ready");
      return;
    }

    fetchCompany();
  }, [user, loading]);

  /* ================= UPDATE COMPANY INFO ================= */
  const updateCompany = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);

      const id = payload.id ?? company.id;
      if (!id) throw new Error("Company ID nije definisan");

      const res = await API.put(`/companies/${id}`, payload);
      const data = res.data?.company ?? {};

      setCompany(prev => {
        const updated = { ...prev, ...data };
        setCompanyComplete(isCompanyComplete(updated));
        return updated;
      });

      return data;
    } catch (err) {
      console.error("Greška pri update firme:", err);
      throw err;
    }
  };

  /* ================= SET COMPANY IMAGES ================= */
  const setCompanyImages = (images) => {
    setCompany(prev => {
      const updated = { ...prev, images };
      setCompanyComplete(isCompanyComplete(updated));
      return updated;
    });
  };

  /* ================= SERVICES ================= */
  const updateCompanyServices = async (services) => {
    if (!company.id) throw new Error("Company ID nije definisan");

    try {
      const res = await API.put(`/companies/${company.id}/services`, { services });
      const updatedServices = res.data.services || [];

      setCompany(prev => {
        const updated = { ...prev, services: updatedServices };
        setCompanyComplete(isCompanyComplete(updated)); // ⬅️ automatski update complete
        return updated;
      });

      return updatedServices;
    } catch (err) {
      console.error("Greška pri update servisa:", err);
      throw err;
    }
  };

  /* ================= SLOTS ================= */
  const updateCompanySlots = async (slots) => {
    if (!company.id) throw new Error("Company ID nije definisan");

    try {
      const res = await API.put(`/companies/${company.id}/slots`, { slots });
      const updatedSlots = res.data.slots || [];

      setCompany(prev => {
        const updated = { ...prev, slots: updatedSlots };
        setCompanyComplete(isCompanyComplete(updated)); // ⬅️ automatski update complete
        return updated;
      });

      return updatedSlots;
    } catch (err) {
      console.error("Greška pri update slotova:", err);
      throw err;
    }
  };

  /* ================= SAVE EVERYTHING ================= */
  const saveCompanyData = async ({ name, description, services, slots }) => {
    const updatedCompany = await updateCompany({ id: company.id, name, description });
    const updatedServices = await updateCompanyServices(services);
    const updatedSlots = await updateCompanySlots(slots);

    return { updatedCompany, updatedServices, updatedSlots };
  };

  /* ================= PROVIDER ================= */
  return (
    <CompanyContext.Provider
      value={{
        company,
        status,
        companyComplete,
        fetchCompany,
        updateCompany,
        updateCompanyServices,
        updateCompanySlots,
        setCompanyImages,
        saveCompanyData,
        setCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};