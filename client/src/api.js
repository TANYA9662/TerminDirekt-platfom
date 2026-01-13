import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

// postavljanje auth tokena
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// AUTH
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

// COMPANY
export const createCompany = async (payload) => API.post("/companies", payload);
export const updateCompanyAPI = async (id, payload) =>
  API.patch(`/companies/${id}`, payload);

export default API;
