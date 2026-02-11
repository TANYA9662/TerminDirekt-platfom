import axios from "axios";

// Kreiramo instancu API-ja
const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`, // koristi env varijablu za backend
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
  return res.data;
};

export const registerUser = async (payload) => {
  const res = await API.post("/auth/register", payload);
  return res.data;
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

export const getCompanyByUserId = async (userId) => {
  const res = await API.get(`/companies/user/${userId}`);
  return res.data;
};

export const getMyCompany = async () => {
  const res = await API.get("/companies/me");
  return res.data;
};

export const updateCompanyServices = async (companyId, services) => {
  const res = await API.put(`/companies/${companyId}/services`, { services });
  return res.data;
};

export const uploadCompanyImages = async (companyId, formData) => {
  const res = await API.post(`/companies/${companyId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getCompanySlots = async (companyId) => {
  const res = await API.get(`/companies/${companyId}/slots`);
  return res.data;
};

export const saveCompanySlots = async (companyId, slots) => {
  const res = await API.put(`/companies/${companyId}/slots`, { slots });
  return res.data;
};

export default API;
