import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success } = await login({ email, password });

    if (success) navigate("/home");
    else alert("Login failed. Please check credentials.");
  };

return (
  <div className="relative w-full min-h-screen overflow-hidden">

    {/* Background */}
    <img
      src="images/mainBg.png"
      alt="background"
      className="absolute inset-0 w-full h-full object-fill"
    />

    {/* Card Container */}
    <div
      data-aos="zoom-out-left"
      className="absolute right-[9%] top-[8%]"
    >
      <div className="
        w-[350px] min-h-[480px]
        px-10 py-12
        rounded-[42px]
        bg-gradient-to-b from-[#1E3A8A] to-[#3B82F6]
        backdrop-blur-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        flex flex-col items-center
      ">

        {/* Logo */}
        <img
          src="/images/tatd.png"
          alt="logo"
          className="w-[150px] h-[150px] object-contain  brightness-0 invert"
        />

        {/* Title */}
        <h2 className="text-3xl font-bold text-white tracking-wide mb-6">
          Welcome Back
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
        >

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full h-11 px-5
              rounded-xl
              border border-blue-500
              bg-white
              text-slate-700
              placeholder-slate-400
              shadow-sm
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-blue-800
              focus:border-blue-500
            "
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full h-11 px-5
              rounded-xl
              border border-blue-500
              bg-white
              text-slate-700
              placeholder-slate-400
              shadow-sm
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-blue-800
              focus:border-blue-500
            "
            required
          />

          {/* Button */}
          <button
            type="submit"
            className="
              w-full mt-6 py-3
              rounded-full
              text-gray-800 text-lg font-semibold
              bg-white
              shadow-lg shadow-indigo-500/30
              transition-all duration-300
              hover:scale-[1.03]
              active:scale-[0.98]
            "
          >
            Sign In
          </button>

        </form>
      </div>
    </div>
  </div>
);

}

export default Loginpage;
