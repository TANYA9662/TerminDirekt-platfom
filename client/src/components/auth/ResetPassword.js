import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError(t("auth.invalid_token", "Token nije validan."));
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError(t("auth.password_mismatch", "Lozinke se ne poklapaju."));
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", { token, password });
      setMessage(
        t(
          "auth.password_changed",
          "Lozinka je uspešno promenjena. Možete se prijaviti."
        )
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || t("auth.reset_error", "Došlo je do greške.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-textDark">
          {t("auth.new_password", "Nova lozinka")}
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder={t("auth.new_password", "Nova lozinka")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-textDark placeholder:text-gray-400 focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
          <input
            type="password"
            placeholder={t("auth.confirm_password", "Potvrdite lozinku")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-textDark placeholder:text-gray-400 focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg font-bold text-white ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-400 hover:bg-accentLight"
              } transition`}
          >
            {loading
              ? t("auth.updating", "Ažuriranje...")
              : t("auth.change_password", "Promeni lozinku")}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-accent hover:underline"
            onClick={() => navigate("/login")}
          >
            {t("auth.back_to_login", "Nazad na prijavu")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
