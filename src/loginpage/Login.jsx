import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { success } = await login({ email, password });
    if (success) {
      toast.success("Welcome Back!");
      navigate("/home");
    } else {
      toast.error("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT — Ride visual (Ola/Uber style) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80')",
            filter: "blur(2px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/90 via-[#0f2744]/85 to-[#1a3a5c]/80" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Dvagoo Chauffeur</p>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight max-w-lg">
              Manage rides.<br />Assign drivers.<br />Track everything.
            </h1>
            <p className="text-slate-300 mt-5 max-w-md text-base leading-relaxed">
              Your command center for drivers, fleet, trips, payments and customers — all in one place.
            </p>
          </div>

          <div className="flex gap-8 text-white/80 text-sm">
            <div>
              <p className="text-2xl font-bold text-white">Live</p>
              <p>Trip Tracking</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Instant</p>
              <p>Driver Assign</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Full</p>
              <p>Payment View</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login form with logo */}
      <div className="flex w-full lg:w-[45%] items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/images/dvagoo.png"
              alt="Dvagoo Logo"
              className="w-32 md:w-36 object-contain mb-5 rounded-2xl shadow-lg border border-gray-100"
            />
            <h2 className="text-2xl font-bold text-gray-900">Admin Sign In</h2>
            <p className="text-sm text-gray-500 mt-1 text-center">Enter your credentials to access the control panel</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="admin@dvagoo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 rounded-lg bg-[#0f2744] text-white font-semibold transition ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#1a3a5c] hover:shadow-lg"
              }`}
            >
              {isLoading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">Dvagoo Admin Panel · Secure Access</p>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;
