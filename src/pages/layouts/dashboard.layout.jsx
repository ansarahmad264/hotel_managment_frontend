import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.slice";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const navItems = [
  { label: "Home", to: "/dashboard/home", icon: "home" },
  { label: "Orders", to: "/dashboard/orders", icon: "receipt" },
  { label: "Products", to: "/dashboard/products", icon: "box" },
];

const iconPaths = {
  home: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-9.5Z",
  receipt: "M7 3h10l2 2v14l-2-2-2 2-2-2-2 2-2-2-2 2V5l2-2Zm0 0v16",
  box: "M4 7.5 12 4l8 3.5-8 3.5-8-3.5Zm0 4L12 15l8-3.5M4 7.5v9l8 3.5 8-3.5v-9",
  users:
    "M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 7a5 5 0 0 1 10 0M16.5 10a3.5 3.5 0 1 1 0 7",
};

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  console.log("userrr---", user);
  // navigate
  const navigate = useNavigate();
  // location
  const location = useLocation();
  // is desktop
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  // sidebar open
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setSidebarOpen(true);
      }
      if (!event.matches) {
        setSidebarOpen(false);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // handle logout
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    navigate("/", { replace: true });
  };

  const currentSection =
    navItems.find((item) => location.pathname.startsWith(item.to))?.label ||
    "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="relative flex h-screen">
        {!isDesktop && sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white px-4 pb-6 pt-8 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex h-full flex-col`}
        >
          <div className="mb-10 flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M10 18h10"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  DineFlow
                </p>
                <p className="text-sm font-semibold text-slate-900">Manager</p>
              </div>
            </div>
            {!isDesktop && (
              <button
                type="button"
                aria-label="Collapse sidebar"
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 18-6-6 6-6"
                  />
                </svg>
              </button>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")
                }
                onClick={() => {
                  if (!isDesktop) setSidebarOpen(false);
                }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={iconPaths[item.icon]}
                    />
                  </svg>
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className=" mt-auto space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Logged in
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 ring-1 ring-sky-200">
                {user?.name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "A"}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-slate-500">{user?.email || "Signed in"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex  w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Toggle sidebar"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200 lg:hidden"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M8 18h12"
                    />
                  </svg>
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Dashboard
                  </p>
                  <p className="text-xl font-semibold text-slate-900">
                    {currentSection}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleLogout}>
                  {loading ? (
                    "Logging out..."
                  ) : (
                    <>
                      <span>Logout</span>
                      <LogOut />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="no-scrollbar flex-1 overflow-auto px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
