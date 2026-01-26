import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "company",
    city: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validacija
    if (!form.email.trim() || !form.password.trim()) {
      setError("Morate uneti email i lozinku");
      return;
    }

    if (form.role === "company" && !form.name.trim()) {
      setError("Morate uneti naziv firme");
      return;
    }

    const payload = {
      name: form.name.trim() || form.email.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      city: form.city.trim() || null,
      phone: form.phone.trim() || null,
    };

    try {
      const res = await registerUser(payload);

      login(res.user, res.token);

      // Redirect zavisi od role
      if (res.user.role === "company") {
        navigate("/onboarding/company");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Greška pri registraciji");
    }
  };

  return (
    < div className="min-h-screen flex items-center justify-center bg-gray-100" >
      <div className="p-10 rounded-2xl bg-white border border-gray-400 shadow-2xl w-full max-w-md backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Registracija</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          >
            <option value="user">Korisnik</option>
            <option value="company">Firma</option>
          </select>

          <input
            name="name"
            type="text"
            placeholder={form.role === "company" ? "Naziv firme" : "Ime korisnika"}
            value={form.name}
            onChange={handleChange}
            required={form.role === "company"}
            className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          />

          {form.role === "company" && (
            <>
              <input
                name="city"
                type="text"
                placeholder="Grad"
                value={form.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
              />
              <input
                name="phone"
                type="text"
                placeholder="Telefon"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
              />
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          />
          <input
            name="password"
            type="password"
            placeholder="Lozinka"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-400 shadow-2xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          />

          <button
            type="submit"
            className="w-full bg-white/80  text-gray-900  border border-gray-400 shadow-2xl  font-bold p-3 rounded-lg hover:bg-accent transition"
          >
            Registruj se
          </button>
        </form>
      </div>
    </div >

  );
};

export default Register;
