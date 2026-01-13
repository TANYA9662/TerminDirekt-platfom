// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import API, { setAuthToken } from "../api";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
        setIsCompany(!!res.data.company); // true ako ima firmu
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, isCompany };
}
