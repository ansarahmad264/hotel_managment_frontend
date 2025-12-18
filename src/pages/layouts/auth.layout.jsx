import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-x-0 top-[-20%] mx-auto h-80 max-w-3xl rounded-full bg-linear-to-r from-emerald-400/50 via-amber-300/40 to-emerald-500/40 blur-3xl" />
      </div>
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
