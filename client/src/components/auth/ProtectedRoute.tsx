import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isTokenValid = (token: any) => {
    if (!token) return false;
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedJson = JSON.parse(window.atob(payloadBase64));
      const exp = decodedJson.exp;
      const now = Math.floor(Date.now() / 1000);
      return exp > now;
    } catch (e) {
      return false;
    }
  };

  const authenticated = isTokenValid(token);

  if (!authenticated) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // LOGIC: If the URL starts with /resident, send to resident-login
    // Otherwise, send to the default /signin (Admin)
    const isResidentPath = location.pathname.startsWith("/resident");
    const redirectPath = isResidentPath ? "/resident-login" : "/signin";

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;