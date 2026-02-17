import axios from "axios";
import i18n from "./i18n";

// Kreiramo instancu API-ja
const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: true,
});

// Postavimo default jezik odmah na skraćeni kod (sr/en/sv)
API.defaults.headers.common["Accept-Language"] = i18n.language.split("-")[0];

export const setLanguageHeader = (lang) => {
  const shortLang = lang.split("-")[0];  // izvuče samo 'sr', 'en', 'sv'
  API.defaults.headers.common["Accept-Language"] = shortLang;
};


// Auth token
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/* ===== AUTH ===== */
export const loginUser = async (payload) => (await API.post("/auth/login", payload)).data;
export const registerUser = async (payload) => (await API.post("/auth/register", payload)).data;
export const getCurrentUser = async () => (await API.get("/auth/me")).data;

/* ===== COMPANY ===== */
export const createCompany = async (payload) => (await API.post("/companies", payload)).data;
export const updateCompanyAPI = async (id, payload) => (await API.put(`/companies/${id}`, payload)).data;
export const getAllCompanies = async () => (await API.get("/companies")).data;
export const getCompanyImages = async (companyId) => (await API.get(`/companies/${companyId}/images`)).data;
export const getCompanyByUserId = async (userId) => (await API.get(`/companies/user/${userId}`)).data;
export const getMyCompany = async () => (await API.get("/companies/me")).data;
export const updateCompanyServices = async (companyId, services) => (await API.put(`/companies/${companyId}/services`, { services })).data;
export const uploadCompanyImages = async (companyId, formData) => (await API.post(`/companies/${companyId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
export const getCompanySlots = async (companyId) => (await API.get(`/companies/${companyId}/slots`)).data;
export const saveCompanySlots = async (companyId, slots) => (await API.put(`/companies/${companyId}/slots`, { slots })).data;

export default API;
