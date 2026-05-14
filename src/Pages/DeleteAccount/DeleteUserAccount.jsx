import React, { useState } from "react";
import {
  sendDeleteOtpApi,
  verifyDeleteOtpApi,
  deleteAccountApi,
} from "../../Services/DeleteAccountApi";

const DeleteUser = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const type = "user"; // ✅ CHANGE ONLY THIS

  // ✅ SEND OTP
  const handleSendOtp = async () => {
    if (!mobile) {
      setMessage("Please enter mobile number");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await sendDeleteOtpApi(mobile, type);

      if (res?.status) {
        setStep(2);
        setMessage("OTP sent successfully ✅");
      } else {
        setMessage(res?.message || "Failed to send OTP ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFY OTP → DELETE ACCOUNT
  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // 🔥 STEP 1: VERIFY OTP
      const verifyRes = await verifyDeleteOtpApi(mobile, otp, type);

      if (!verifyRes?.status) {
        setMessage(verifyRes?.message || "Invalid OTP ❌");
        return;
      }

      // 🔥 STEP 2: GET USER ID
      const userId = verifyRes?.data?._id;

      if (!userId) {
        setMessage("User ID not found ❌");
        return;
      }

      // 🔥 STEP 3: DELETE ACCOUNT
      const deleteRes = await deleteAccountApi(userId, type);

      if (deleteRes?.status) {
        setMessage("User Account Deleted Successfully ✅");

        // reset
        setMobile("");
        setOtp("");
        setStep(1);
      } else {
        setMessage(deleteRes?.message || "Delete failed ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Verification failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Delete User Account
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 rounded-lg"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify & Delete"}
            </button>
          </>
        )}

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeleteUser;