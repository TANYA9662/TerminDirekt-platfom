import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, setAuthToken } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isCompanyComplete = (company) => {
    return (
      company &&
      company.name?.trim() &&
      company.description?.trim() &&
      Array.isArray(company.images) &&
      company.images.length > 0 &&
      Array.isArray(company.services) &&
      company.services.length > 0
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email: form.email, password: form.password });
      const { token, user } = res;

      setAuthToken(token);

      let company = null;
      if (user.role === "company") {
        const companyRes = await API.get(`/companies/user/${user.id}/details`);
        company = companyRes.data;
      }

      login({ ...user, company }, token);

      if (user.role === "company") {
        navigate(isCompanyComplete(company) ? "/company-dashboard" : "/onboarding/company");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || t("auth.login_error", "Greška pri prijavi")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-textDark">
          {t("auth.login", "Prijava")}
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder={t("auth.email", "Email")}
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          />

          <input
            type="password"
            name="password"
            placeholder={t("auth.password", "Lozinka")}
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          />

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/reset-password-request")}
              className="text-sm text-accent hover:underline"
            >
              {t("auth.forgot_password", "Zaboravili ste lozinku?")}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 border border-gray-400 shadow-2xl rounded-lg font-bold text-gray-900 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-white/80 hover:bg-accent"
              } transition`}
          >
            {loading ? t("auth.logging_in", "Prijavljivanje...") : t("auth.login_button", "Prijavi se")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
