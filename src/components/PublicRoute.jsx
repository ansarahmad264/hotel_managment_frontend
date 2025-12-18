import React from "react";
import { useAuthStore } from "@/store/auth.slice";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ redirectTo = "/dashboard" }) => {
  // is authenticated
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
