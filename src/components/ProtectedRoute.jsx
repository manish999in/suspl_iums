// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!Cookies.get("token"); // Check for the token

  return isAuthenticated ? element : <Navigate to="/" />; // Redirect if not authenticated
};

export default ProtectedRoute;
