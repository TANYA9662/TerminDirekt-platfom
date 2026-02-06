// src/components/auth/RoleRoute.js
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const RoleRoute = ({ allow, children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);

    // checking 'role' or 'type'
    const userRole = decoded.role || decoded.role;

    if (!allow.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
};

export default RoleRoute;
