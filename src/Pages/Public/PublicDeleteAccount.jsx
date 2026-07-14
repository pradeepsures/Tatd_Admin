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
    <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '400px', width: '90%' }}>
        
        {step !== 3 && (
          <h2 style={{ color: '#dc2626', textAlign: 'center', marginBottom: '10px', fontSize: '24px', fontWeight: 'bold' }}>
            Delete Account
          </h2>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <p style={{ color: '#4b5563', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
              Select your account type and enter your registered mobile number or email to receive an OTP.
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151' }}>Account Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151' }}>Mobile Number / Email</label>
              <input 
                type="text" 
                placeholder="Enter registered mobile or email" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ color: '#4b5563', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
              An OTP has been sent to <strong>{identifier}</strong>. Please enter it below to confirm account deletion.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151' }}>Enter OTP</label>
              <input 
                type="text" 
                placeholder="Enter 4-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', textAlign: 'center', letterSpacing: '2px', fontSize: '18px' }}
                maxLength={6}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}
            >
              {loading ? 'Processing...' : 'Verify & Delete Account'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>
              ✓
            </div>
            <h2 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '24px', fontWeight: 'bold' }}>Account Deleted</h2>
            <p style={{ color: '#4b5563', fontSize: '15px' }}>
              Your {type} account has been successfully deleted. We're sorry to see you go!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicDeleteAccount;
