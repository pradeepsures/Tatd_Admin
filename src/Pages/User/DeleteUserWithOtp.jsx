import React, { useState } from "react";
import {
  sendDeleteAccountOtpApi,
  verifyDeleteAccountOtpApi,
} from "../../Services/UserApi";

const DeleteUser = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Send OTP
  const handleSendOtp = async () => {
    if (!mobile) {
      setMessage("Please enter mobile number");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await sendDeleteAccountOtpApi(mobile);

      if (result.status) {
        setStep(2);
        setMessage("OTP sent successfully ✅");
      } else {
        setMessage(result.message || "Failed to send OTP");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Delete
  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await verifyDeleteAccountOtpApi(mobile, otp);

      if (result.status) {
        setMessage("User Deleted Successfully ✅");
        setMobile("");
        setOtp("");
        setStep(1);
      } else {
        setMessage(result.message || "Invalid OTP ❌");
      }
    } catch (error) {
      setMessage(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Delete User Account
        </h2>

        {step === 1 && (
          <>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mobile Number
            </label>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-950 via-zinc-950 to-slate-900 text-white py-2 rounded-lg"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-950 via-zinc-950 to-slate-900 text-white py-2 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify & Delete"}
            </button>
          </>
        )}

        {message && (
          <div className="mt-4 text-center text-sm text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteUser;