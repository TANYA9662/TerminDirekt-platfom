// hooks/useAuth.js
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
        let currentUser = res.data;

        // if it's company, fetch company details
        if (currentUser.role === "company") {
          const companyRes = await API.get(`/companies/user/${currentUser.id}/details`);
          currentUser = { ...currentUser, company: companyRes.data };
        }

        setUser(currentUser);
        setIsCompany(currentUser.role === "company");
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        setUser(null);
        setIsCompany(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, setUser, loading, isCompany };
}
