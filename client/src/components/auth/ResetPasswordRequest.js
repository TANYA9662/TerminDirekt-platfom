import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // call backend route
      await API.post("/auth/reset-password-request", { email });
      setMessage("Proverite svoj email za link za reset lozinke.");
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-textDark">Reset lozinke</h2>

        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Unesite svoj email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-textDark placeholder:text-gray-400 focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg font-bold text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-400 hover:bg-accentLight"} transition`}
          >
            {loading ? "Slanje..." : "Pošalji link za reset"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-accent hover:underline"
            onClick={() => navigate("/login")}
          >
            Nazad na prijavu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
