import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../compoents/Loader';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

const PublicDeleteAccount = () => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('user');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [entityId, setEntityId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error("Please enter mobile number or email");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/mobileCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: identifier, type })
      });
      const data = await res.json();
      
      if (res.ok && data.status) {
        toast.success(data.message || "OTP sent successfully!");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter OTP");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/deleteVerifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: identifier, otp, type })
      });
      const data = await res.json();

      if (res.ok && data.status) {
        toast.success("OTP Verified! Processing account deletion...");
        setEntityId(data.data._id);
        
        // Step 3: Delete Account immediately after OTP success
        await handleDeleteAccount(data.data._id);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Delete Account
  const handleDeleteAccount = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/user/deleteAccount/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();

      if (res.ok && data.status) {
        setStep(3); // Show success screen
      } else {
        toast.error(data.message || "Failed to delete account");
      }
    } catch (err) {
      toast.error("Something went wrong while deleting account");
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-slate-100">
      <header className="relative overflow-hidden bg-[#111827]">
        <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
              <img src="/images/dvagoo.png" alt="Dvagoo" className="h-full w-full scale-[1.3] object-cover" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Dvagoo</span>
          </div>
        </div>
      </header>
      <main className="mx-auto -mt-16 w-full max-w-md px-4 pb-12">
      <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-8">
        
        {step !== 3 && (
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-900">
            Delete Account
          </h2>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
              Select your account type and enter your registered mobile number or email to receive an OTP.
            </p>
            
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Account Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5"
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Mobile Number / Email</label>
              <input 
                type="text" 
                placeholder="Enter registered mobile or email" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
              An OTP has been sent to <strong>{identifier}</strong>. Please enter it below to confirm account deletion.
            </p>

            <div className="mb-6">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Enter OTP</label>
              <input 
                type="text" 
                placeholder="Enter 4-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 !h-12 text-center !text-lg font-semibold tracking-wide"
                maxLength={6}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 mb-3"
            >
              {loading ? 'Processing...' : 'Verify & Delete Account'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="py-2 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-600 ring-1 ring-inset ring-emerald-500/25">
              ✓
            </div>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">Account Deleted</h2>
            <p className="text-[15px] leading-relaxed text-slate-500">
              Your {type} account has been successfully deleted. We're sorry to see you go!
            </p>
          </div>
        )}

      </div>
      <p className="mt-6 text-center text-xs text-slate-400">© Dvagoo. All rights reserved.</p>
      </main>
    </div>
  );
};

export default PublicDeleteAccount;
