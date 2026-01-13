import React, { createContext, useState, useEffect } from "react";
import API, { setAuthToken, getCurrentUser } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();

        let company = null;
        if (res.role?.toLowerCase() === "company") {
          const companyRes = await API.get(`/companies/user/${res.id}/details`);
          company = companyRes.data;
        }

        setUser({
          ...res,
          role:
            res.role?.toLowerCase() === "admin"
              ? "company"
              : res.role?.toLowerCase(),
          company,
        });
      } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("token");
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setAuthToken(token);

    setUser({
      ...userData,
      role:
        userData.role?.toLowerCase() === "admin"
          ? "company"
          : userData.role?.toLowerCase(),
      company: userData.company || null,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
