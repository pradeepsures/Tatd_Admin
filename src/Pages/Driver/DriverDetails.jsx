import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getSingleDriver, updateDriver, getSingleDriverBankDetails, reverifyBankDetails, adminAddUpdateBankDetails } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({ accountName: '', accountNumber: '', ifscCode: '' });
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageName, setPreviewImageName] = useState("");

  const downloadImage = async (url, filename) => {
    if (!url) {
      toast.error("Image not available");
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(error.message || "Unable to download image");
    }
  };

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const result = await getSingleDriver(id);

      if (result?.status) {
        setDriver(result.data);
      }
    } catch (err) {
      toast.error("Failed to load chauffeur details");
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      setBankLoading(true);
      const result = await getSingleDriverBankDetails(id);
      if (result?.status) {
        setBankDetails(result.data);
      }
    } catch (err) {
      // It's possible the driver hasn't added bank details yet.
      console.log("No bank details found");
    } finally {
      setBankLoading(false);
    }
  };

  const handleReverifyBank = async () => {
    try {
      toast.loading("Reverifying IFSC code...", { id: "reverify" });
      const result = await reverifyBankDetails(id);
      if (result?.status) {
        toast.success("Bank details reverified", { id: "reverify" });
        fetchBankDetails(); // refresh details
      }
    } catch (error) {
      toast.error("Failed to reverify bank details", { id: "reverify" });
    }
  };

  const handleVerify = async () => {
    try {
      const formData = new FormData();
      formData.append("isVerified", !driver.isVerified);
      
      toast.loading("Updating verification status...", { id: "verify" });
      const result = await updateDriver(id, formData);
      if (result?.status) {
        toast.success("Verification status updated", { id: "verify" });
        setDriver(result.data); // Update local state with new driver data
      }
    } catch (error) {
      toast.error("Failed to update verification status", { id: "verify" });
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankForm.accountName || !bankForm.accountNumber || !bankForm.ifscCode) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setBankSubmitting(true);
      toast.loading("Verifying and saving bank details...", { id: "bankSubmit" });
      const result = await adminAddUpdateBankDetails(id, bankForm);
      if (result?.status) {
        toast.success(result.message, { id: "bankSubmit" });
        setBankModalOpen(false);
        setBankForm({ accountName: '', accountNumber: '', ifscCode: '' });
        fetchBankDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update bank details", { id: "bankSubmit" });
    } finally {
      setBankSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDriver();
      fetchBankDetails();
    }
  }, [id]);

  if (loading) return <Loader />;
  if (!driver) return <div className="p-6">No Driver Found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Driver Details</h2>
          <p className="text-sm text-blue-100 mt-1">Manage and view driver profile, documents, and banking.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 shadow rounded-xl flex items-center gap-4 border-l-4 border-yellow-400">
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Driver Rating</p>
            <h2 className="text-2xl font-bold text-gray-800">{driver.rating || "N/A"}</h2>
          </div>
        </div>

        <div className="bg-white p-5 shadow rounded-xl flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Rides</p>
            <h2 className="text-2xl font-bold text-gray-800">{driver.totalRides || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-5 shadow rounded-xl flex items-center gap-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Current Status</p>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${driver.isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
              {driver.isOnline ? "Online" : "Offline"}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Profile & Info */}
        <div className="xl:col-span-1 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={driver.profilePic || "https://via.placeholder.com/150"}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 shadow-md"
              />
              <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${driver.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mt-4">{driver.name} {driver.midName} {driver.lastName}</h3>
            <p className="text-gray-500 mt-1">{driver.email}</p>
            <p className="text-gray-700 font-medium mt-1">{driver.phone}</p>
            
            <div className="mt-4 w-full border-t pt-4">
              <div className="flex flex-col gap-3">
                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-medium ${
                  driver.isVerified ? "bg-green-100 text-green-700 border border-green-200" : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                }`}>
                  {driver.isVerified ? "✅ Verified Driver" : "⚠️ Pending Verification"}
                </span>
                <button
                  onClick={handleVerify}
                  className={`w-full px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors shadow-sm ${
                    driver.isVerified
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {driver.isVerified ? "Revoke Verification" : "Verify Driver Now"}
                </button>
              </div>
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Personal Information
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Gender</span> <span className="font-medium text-gray-800">{driver.gender || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Alt Phone</span> <span className="font-medium text-gray-800">{driver.alternatePhone || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Completed Rides</span> <span className="font-medium text-gray-800">{driver.completedRidesCount || 0}</span></div>
            </div>
            
            <h4 className="font-bold text-gray-800 text-lg mt-6 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Address
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Current Address</span>
                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{driver.currentAddress || "Not Provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Permanent Address</span>
                <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">{driver.permanentAddress || "Not Provided"}</p>
              </div>
            </div>
          </div>
          
          {/* VEHICLE PREFERENCES */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4l1-1h12l1 1v4.5l-1 1h-2v3.5l1 1v1.5h-10v-1.5l1-1v-3.5h-2l-1-1V4z" />
              </svg>
              Vehicle Assignment
            </h4>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {driver.VehiclePreferenceCategory?.length > 0 ? driver.VehiclePreferenceCategory.map((item) => (
                  <span key={item._id} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                    {item.name}
                  </span>
                )) : <span className="text-sm text-gray-400">None</span>}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Preferences</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {driver.vechiclePreferenceSchema?.length > 0 ? driver.vechiclePreferenceSchema.map((item) => (
                  <span key={item._id} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                    {item.name}
                  </span>
                )) : <span className="text-sm text-gray-400">None</span>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Documents & Banking */}
        <div className="xl:col-span-2 space-y-6">
          {/* BANK DETAILS */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Bank Details & Payout
              </h4>
              <div className="flex gap-2">
                {bankDetails && (
                  <button
                    onClick={handleReverifyBank}
                    disabled={bankLoading}
                    className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {bankLoading ? "Verifying..." : "Reverify IFSC"}
                  </button>
                )}
                <button
                  onClick={() => setBankModalOpen(true)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                >
                  {bankDetails ? "Update Bank" : "Add Bank"}
                </button>
              </div>
            </div>

            {bankLoading && !bankDetails ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : bankDetails ? (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Account Holder</p>
                  <p className="font-bold text-gray-800">{bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Account Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 font-mono tracking-widest">{bankDetails.accountNumber}</p>
                    <button onClick={() => { navigator.clipboard.writeText(bankDetails.accountNumber); toast.success("Copied!"); }} className="text-blue-500 hover:text-blue-700" title="Copy">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">IFSC Code</p>
                  <p className="font-bold text-gray-800 uppercase">{bankDetails.ifscCode}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Verification Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${bankDetails.isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {bankDetails.isVerified ? "VERIFIED ✅" : "PENDING ❌"}
                  </span>
                </div>
                {bankDetails.bankName && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Bank Name</p>
                    <p className="font-medium text-gray-700">{bankDetails.bankName} {bankDetails.branchName && `(${bankDetails.branchName})`}</p>
                  </div>
                )}
                {bankDetails.upiId && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">UPI ID</p>
                    <p className="font-medium text-gray-700">{bankDetails.upiId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-full text-amber-600 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-bold text-amber-800 text-lg">Bank Details Missing</h5>
                  <p className="text-amber-700 text-sm mt-1">This driver cannot receive payouts until their bank account or UPI details are added and verified. Please add the details using the button above.</p>
                </div>
              </div>
            )}
          </div>

          {/* DOCUMENTS GRID */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <h4 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Identity & Documents
              </h4>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* License Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-gray-800">Driving License</h5>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{driver.licenseNumber || "N/A"}</p>
                    <p className="text-xs text-gray-500 mt-1">Exp: {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">DL</span>
                </div>
                {driver.licensePhoto ? (
                  <div className="relative group rounded overflow-hidden h-32 bg-gray-200 border border-gray-300">
                    <img src={driver.licensePhoto} alt="License" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.licensePhoto); setPreviewImageName(`driver-license-${id}.jpg`); }}>
                      <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-100 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                      </button>
                    </div>
                  </div>
                ) : <div className="h-32 bg-gray-100 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">No Document</div>}
              </div>

              {/* Police Verification Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-gray-800">Police Verification</h5>
                    <p className="text-xs text-gray-500 mt-1">Exp: {driver.policeVerificationExpiry ? new Date(driver.policeVerificationExpiry).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded font-medium">PV</span>
                </div>
                {driver.policeVerificationPhoto ? (
                  <div className="relative group rounded overflow-hidden h-32 bg-gray-200 border border-gray-300">
                    <img src={driver.policeVerificationPhoto} alt="Police" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.policeVerificationPhoto); setPreviewImageName(`driver-pv-${id}.jpg`); }}>
                      <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-100 shadow">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                      </button>
                    </div>
                  </div>
                ) : <div className="h-32 bg-gray-100 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">No Document</div>}
              </div>

              {/* Aadhaar Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-gray-800">Aadhaar Card</h5>
                    <p className="text-xs text-gray-500 mt-1 font-mono tracking-widest">{driver.adhaarNumber || "N/A"}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-medium">ID</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {driver.adhaarFrontPhoto ? (
                    <div className="relative group rounded overflow-hidden h-32 bg-gray-200 border border-gray-300">
                      <img src={driver.adhaarFrontPhoto} alt="Aadhaar Front" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">FRONT</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.adhaarFrontPhoto); setPreviewImageName(`driver-aadhaar-front-${id}.jpg`); }}>
                        <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-100 shadow">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="h-32 bg-gray-100 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">Front missing</div>}
                  
                  {driver.adhaarBackPhoto ? (
                    <div className="relative group rounded overflow-hidden h-32 bg-gray-200 border border-gray-300">
                      <img src={driver.adhaarBackPhoto} alt="Aadhaar Back" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">BACK</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.adhaarBackPhoto); setPreviewImageName(`driver-aadhaar-back-${id}.jpg`); }}>
                        <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-100 shadow">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="h-32 bg-gray-100 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">Back missing</div>}
                </div>
              </div>

              {/* PAN Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-gray-800">PAN Card</h5>
                    <p className="text-xs text-gray-500 mt-1 font-mono tracking-widest">{driver.panNumber || "N/A"}</p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-medium">TAX</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {driver.panFrontPhoto ? (
                    <div className="relative group rounded overflow-hidden h-32 bg-gray-200 border border-gray-300">
                      <img src={driver.panFrontPhoto} alt="PAN Front" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">FRONT</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.panFrontPhoto); setPreviewImageName(`driver-pan-front-${id}.jpg`); }}>
                        <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-100 shadow">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="h-32 bg-gray-100 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">Front missing</div>}
                  
                  {driver.panBackPhoto ? (
                     <div className="relative group rounded overflow-hidden h-32 bg-gray-200 border border-gray-300">
                      <img src={driver.panBackPhoto} alt="PAN Back" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">BACK</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.panBackPhoto); setPreviewImageName(`driver-pan-back-${id}.jpg`); }}>
                        <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-100 shadow">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="h-32 bg-gray-100 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">Back missing</div>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* BANK MODAL */}
      {bankModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
               <h3 className="text-xl font-bold">{bankDetails ? "Update Bank Details" : "Add Bank Details"}</h3>
               <button onClick={() => setBankModalOpen(false)} className="text-blue-100 hover:text-white transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            <form onSubmit={handleBankSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Holder Name</label>
                <input 
                  type="text" 
                  required
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})}
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 outline-none transition-all"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
                <input 
                  type="text" 
                  required
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 outline-none transition-all font-mono"
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  required
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 outline-none transition-all uppercase font-mono"
                  placeholder="e.g. SBIN0001234"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setBankModalOpen(false)}
                  className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={bankSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {bankSubmitting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
                  ) : "Save & Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="absolute top-6 right-6 flex gap-4">
            <button 
              onClick={() => downloadImage(previewImage, previewImageName)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download File
            </button>
            <button 
              onClick={() => { setPreviewImage(null); setPreviewImageName(""); }}
              className="bg-white/10 hover:bg-white/30 text-white border border-white/20 px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Close
            </button>
          </div>
          <img src={previewImage} alt="Document Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}

    </div>
  );
}
