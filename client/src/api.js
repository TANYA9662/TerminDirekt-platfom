import axios from "axios";

// Kreiramo instancu API-ja
const API = axios.create({
  baseURL: "http://localhost:3001/api", // sve rute prolaze kroz /api
  withCredentials: true, // šalje cookie ako je potrebno
});

// Postavljanje auth tokena u header
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/* ===== AUTH ===== */
export const loginUser = async (payload) => {
  const res = await API.post("/auth/login", payload);
  return res.data; // { user, token, company? }
};

export const registerUser = async (payload) => {
  const res = await API.post("/auth/register", payload);
  return res.data; // { user, token, company? }
};

export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

/* ===== COMPANY ===== */
export const createCompany = async (payload) => API.post("/companies", payload);

export const updateCompanyAPI = async (id, payload) =>
  API.put(`/companies/${id}`, payload);

export const getAllCompanies = async () => {
  const res = await API.get("/companies");
  return res.data;
};

export const getCompanyImages = async (companyId) => {
  const res = await API.get(`/companies/${companyId}/images`);
  return res.data;
};

// Dobijanje firme po korisniku (umesto /details)
export const getCompanyByUserId = async (userId) => {
  const res = await API.get(`/companies/user/${userId}`);
  return res.data;
};

// Dobijanje moje firme (za ulogovanog korisnika)
export const getMyCompany = async () => {
  const res = await API.get("/companies/me");
  return res.data;
};

// Update services za firmu
export const updateCompanyServices = async (companyId, services) => {
  const res = await API.put(`/companies/${companyId}/services`, { services });
  return res.data;
};

// Upload multiple images za firmu
export const uploadCompanyImages = async (companyId, formData) => {
  const res = await API.post(`/companies/${companyId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Dobijanje slotova za firmu
export const getCompanySlots = async (companyId) => {
  const res = await API.get(`/companies/${companyId}/slots`);
  return res.data;
};

// Save/update slotove za firmu
export const saveCompanySlots = async (companyId, slots) => {
  const res = await API.put(`/companies/${companyId}/slots`, { slots });
  return res.data;
};

export default API;
