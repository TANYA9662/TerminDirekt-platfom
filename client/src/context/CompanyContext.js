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
  useEffect(() => {
    if (!user || user.role !== "company" || loading) {
      setCompany(emptyCompany);
      setCompanyComplete(false);
      setStatus("ready");
      return;
    }

    const fetchCompany = async () => {
      setStatus("loading");
      try {
        const token = localStorage.getItem("token");
        if (token) setAuthToken(token);

        const res = await API.get("/companies/me"); // centralni endpoint
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
        console.error("Greška pri fetchu firme:", err.response?.status, err.response?.data);
        setCompany(emptyCompany);
        setCompanyComplete(false);
      } finally {
        setStatus("ready");
      }
    };

    fetchCompany();
  }, [user, loading]);

  /* ================= UPDATE FUNCTIONS ================= */
  const updateCompany = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);

      const id = payload.id ?? company.id;
      const res = id
        ? await API.put(`/companies/${id}`, payload)
        : await API.post("/companies", payload);

      const data = res.data?.company ?? {};

      setCompany(prev => {
        const updated = {
          ...prev,   // nikad emptyCompany
          ...data,   // samo šta backend vrati
        };
        setCompanyComplete(isCompanyComplete(updated));
        return updated;
      });

      return res.data?.company;
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
    const res = await API.put(`/companies/${company.id}/services`, { services });

    setCompany(prev => {
      const updated = {
        ...prev,
        services: res.data.services,
      };
      setCompanyComplete(isCompanyComplete(updated));
      return updated;
    });

    return res.data.services;
  };

  /* ================= SLOTS ================= */
  const updateCompanySlots = async (slots) => {
    const res = await API.put(`/companies/${company.id}/slots`, { slots });

    setCompany(prev => ({
      ...prev,
      slots: res.data.slots,
    }));

    return res.data.slots;
  };

  /* ================= SAVE EVERYTHING FUNCTION ================= */
  const saveCompanyData = async ({ name, description, services, slots }) => {
    const updatedCompany = await updateCompany({
      id: company.id,
      name,
      description,
    });

    const updatedServices = await updateCompanyServices(services);
    const updatedSlots = await updateCompanySlots(slots);

    return { updatedCompany, updatedServices, updatedSlots };
  };

  /* ================= CONTEXT PROVIDER ================= */
  return (
    <CompanyContext.Provider
      value={{
        company,
        status,
        companyComplete,
        updateCompany,
        updateCompanyServices,
        updateCompanySlots,
        setCompanyImages, // nova funkcija za direktno setovanje slika
        saveCompanyData,
        setCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
