import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdOutlineEmail, MdOutlineLock, MdOutlineMyLocation, MdOutlineBolt, MdOutlineReceiptLong } from "react-icons/md";

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

  const inputWrap =
    "flex h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 transition focus-within:border-[#d9ae4a]/70 focus-within:bg-white/[0.1] focus-within:ring-4 focus-within:ring-[#c99a2e]/15";
  const inputClass = "h-full w-full bg-transparent text-[15px] text-white placeholder:text-gray-400 outline-none";

  const features = [
    { icon: MdOutlineMyLocation, k: "Live", v: "Trip Tracking" },
    { icon: MdOutlineBolt, k: "Instant", v: "Driver Assign" },
    { icon: MdOutlineReceiptLong, k: "Full", v: "Payment View" },
  ];

  return (
    <div className="relative h-screen w-full overflow-y-auto bg-[#0b0d12] text-white">
      {/* Photo backdrop */}
      <div
        className="pointer-events-none fixed inset-0 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2000&q=75')",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-[#08090d]/95 via-[#08090d]/75 to-[#08090d]/55" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#08090d] to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        {/* Brand side */}
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl bg-black ring-1 ring-[#c99a2e]/40">
              <img src="/images/dvagoo.png" alt="Dvagoo" className="h-full w-full scale-[1.3] object-cover" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold">Dvagoo</p>
              <p className="text-xs text-[#d9ae4a]">Chauffeur Admin</p>
            </div>
          </div>

          <h1 className="mt-10 hidden text-4xl font-semibold leading-[1.15] tracking-tight lg:block xl:text-5xl">
            Manage rides.
            <br />
            Assign drivers.
            <br />
            <span className="text-[#d9ae4a]">Track everything.</span>
          </h1>
          <p className="mt-5 hidden max-w-md text-base leading-relaxed text-gray-300 lg:block">
            Your command center for drivers, fleet, trips, payments and customers — all in one place.
          </p>

          <div className="mt-10 hidden max-w-lg grid-cols-3 gap-3 lg:grid">
            {features.map(({ icon: Icon, k, v }) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
                <Icon size={20} className="text-[#d9ae4a]" />
                <p className="mt-3 text-sm font-semibold text-white">{k}</p>
                <p className="text-xs text-gray-400">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Glass login card */}
        <div className="w-full max-w-[420px] lg:mr-6">
          <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-9">
            <h2 className="text-2xl font-semibold tracking-tight">Admin Sign In</h2>
            <p className="mt-1.5 text-sm text-gray-300">Enter your credentials to access the control panel</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">Email</label>
                <div className={inputWrap}>
                  <MdOutlineEmail size={18} className="shrink-0 text-gray-400" />
                  <input
                    type="email"
                    placeholder="admin@dvagoo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">Password</label>
                <div className={inputWrap}>
                  <MdOutlineLock size={18} className="shrink-0 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#c99a2e] text-[15px] font-semibold text-[#0b0d12] shadow-[0_10px_30px_-10px_rgba(201,154,46,0.8)] transition-colors ${
                  isLoading ? "cursor-not-allowed opacity-70" : "hover:bg-[#d9ae4a]"
                }`}
              >
                {isLoading ? (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0b0d12] border-t-transparent" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-gray-400">
              <MdOutlineLock size={14} className="text-[#d9ae4a]" />
              Dvagoo Admin Panel · Secure Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;
