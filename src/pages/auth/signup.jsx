import { SignUpApi } from "@/services/auth/auth.services";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SignupPage = () => {
  // navigate
  const navigate = useNavigate();
  // formdata
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    terms: false,
  });

  const [alert, setAlert] = useState({
    show: false,
    type: "error",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const showAlert = (message, type = "error") => {
    setAlert({
      show: true,
      type,
      message,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert((prev) => ({ ...prev, show: false }));

    const { name, email, password, confirmPassword, phone } = formData;

    if (password !== confirmPassword) {
      setLoading(false);
      showAlert("Passwords do not match.", "error");
      return;
    }

    const payload = {
      name,
      email,
      password,
      phone,
    };

    try {
      const response = await SignUpApi(payload);
      console.log("response--", response);
      if (response?.success) {
        console.log("Setting user:", response?.data?.restaurant);
        toast.success(response.message || "Signup successful!");
        // redirect
        setTimeout(() => {
          navigate("/signin");
        }, 800);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const alertBaseClasses =
    "mt-4 rounded-xl border px-4 py-3 text-sm transition-colors";
  const alertVariantClasses =
    alert.type === "success"
      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
      : "border-red-500/60 bg-red-500/10 text-red-200";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-[-10%] mx-auto h-[300px] max-w-3xl rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-slate-900/80 shadow-2xl ring-1 ring-slate-800 backdrop-blur-xl md:flex-row">
          <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-8 py-10 md:px-10 lg:px-12">
            <div className="fade-in-up">
              <div className="mb-6 inline-flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 10h16M10 14h10M4 18h10"
                    />
                  </svg>
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                  DineFlow
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Create your{" "}
                <span className="text-emerald-400">Restaurant Account</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-slate-300 sm:text-base">
                Join DineFlow and start accepting online orders from your
                customers. Set up your restaurant in just a few minutes.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-200">
                {[
                  "Showcase your full menu with photos and pricing.",
                  "Receive real-time orders from mobile app users.",
                  "Manage availability, timings, and delivery options.",
                ].map((item) => (
                  <li className="flex items-start gap-3" key={item}>
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 13 4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                Log in here
              </Link>
              .
            </p>
          </div>

          <div className="flex w-full flex-1 items-center justify-center bg-slate-900/70 px-6 py-10 sm:px-10 md:max-w-md lg:max-w-lg">
            <div className="w-full max-w-md fade-in-up">
              <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">
                Sign up your restaurant
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Fill in the details below to create your restaurant admin
                account.
              </p>

              {alert.show && (
                <div
                  className={`${alertBaseClasses} ${alertVariantClasses}`}
                  role="alert"
                >
                  {alert.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                  >
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Spice Garden Bistro"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.94 6.34A2 2 0 0 1 4.82 5h10.36a2 2 0 0 1 1.88 1.34L10 10.58 2.94 6.34Z" />
                        <path d="M18 8.08v5.25A2.67 2.67 0 0 1 15.33 16H4.67A2.67 2.67 0 0 1 2 13.33V8.08l7.47 4.46a1 1 0 0 0 1.06 0L18 8.08Z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      id="email"
                      required
                      autoComplete="email"
                      placeholder="owner@yourrestaurant.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    autoComplete="new-password"
                    placeholder="Re-type your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-slate-200"
                  >
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <span className="text-slate-200">Terms & Conditions</span>{" "}
                    and <span className="text-slate-200">Privacy Policy</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  id="signup-button"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span id="signup-button-text">
                    {loading ? "Creating account..." : "Create account"}
                  </span>
                  {loading && (
                    <svg
                      id="signup-spinner"
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v4l3.5-3.5L12 0v4a8 8 0 0 0-8 8h4Z"
                      ></path>
                    </svg>
                  )}
                </button>

                <p className="text-xs text-slate-500">
                  Already registered?{" "}
                  <Link
                    to="/signin"
                    className="font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Log in to your account
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
