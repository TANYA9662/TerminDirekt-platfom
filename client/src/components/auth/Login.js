import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, setAuthToken } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Helper funkcija za proveru da li je onboarding završen
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
      // Login usera sa samo email i password
      const res = await loginUser({ email: form.email, password: form.password });
      const { token, user } = res;

      // Postavi token za buduće API pozive
      setAuthToken(token);

      // Sačuvaj usera i token u context
      login(user, token);

      if (user.role === "company") {
        // Dohvati kompaniju da proverimo onboarding
        const companyRes = await API.get(`/companies/user/${user.id}/details`);
        const company = companyRes.data;

        // Navigiraj prema statusu onboarding-a
        navigate(isCompanyComplete(company) ? "/company-dashboard" : "/onboarding/company");
      } else {
        // Standardni korisnik
        navigate("/dashboard");
      }
    } catch (err) {
      // Prikazi grešku
      setError(err.response?.data?.message || "Greška pri prijavi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Prijava</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Lozinka"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
              }`}
          >
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
