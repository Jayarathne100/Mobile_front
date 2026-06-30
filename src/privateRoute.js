import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredPage }) {
  const role = localStorage.getItem("role");
  const access = JSON.parse(localStorage.getItem("access")) || [];

  // Not logged in → go to login
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Admin → full access
  if (role === "Admin") {
    return children;
  }

  // Non-admin → check access
  const canAccess = access.includes(requiredPage);

  return canAccess ? children : <Navigate to="/NoAccess" replace />;
}

export default ProtectedRoute;
