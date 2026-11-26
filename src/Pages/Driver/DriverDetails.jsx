import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getSingleDriver, updateDriver, getSingleDriverBankDetails, reverifyBankDetails, adminAddUpdateBankDetails, verifyPanOcrApi, verifyDlOcrApi, verifyAadhaarOcrApi } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";

function OcrResult({ result }) {
  if (!result) return null;
  return (
    <div className="mt-1 text-xs">
      <p className={`font-bold ${result.matched ? 'text-emerald-600' : 'text-amber-700'}`}>
        {result.matched ? 'Number found in image' : 'OCR could not confirm the number. Review the document.'}
      </p>
      <details className="mt-1 text-slate-600">
        <summary className="cursor-pointer">View text read from image</summary>
        <p className="mt-1 whitespace-pre-wrap break-words max-h-40 overflow-auto">
          {result.text?.trim() || 'No readable text detected. Try a clearer document image.'}
        </p>
      </details>
    </div>
  );
}

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
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [panOcrResult, setPanOcrResult] = useState(null); // { matched: boolean, text: string }

  const handleVerifyPanOcr = async () => {
    try {
      setIsVerifyingPan(true);
      toast.loading("Verifying PAN via OCR...", { id: "pan-ocr" });
      const result = await verifyPanOcrApi(id);
      if (result?.success) {
        setPanOcrResult({ matched: result.matched, text: result.text });
        if (result.matched) {
          toast.success("PAN number found in image", { id: "pan-ocr" });
        } else {
          toast.error("OCR could not confirm PAN. Review the document and extracted text.", { id: "pan-ocr" });
        }
      } else {
        toast.error("Failed to verify PAN", { id: "pan-ocr" });
      }
    } catch (error) {
      toast.error("Error occurred during PAN verification", { id: "pan-ocr" });
    } finally {
      setIsVerifyingPan(false);
    }
  };

  const [isVerifyingDl, setIsVerifyingDl] = useState(false);
  const [dlOcrResult, setDlOcrResult] = useState(null);

  const handleVerifyDlOcr = async () => {
    try {
      setIsVerifyingDl(true);
      toast.loading("Verifying DL via OCR...", { id: "dl-ocr" });
      const result = await verifyDlOcrApi(id);
      if (result?.success) {
        setDlOcrResult({ matched: result.matched, text: result.text });
        if (result.matched) toast.success("DL number found in image", { id: "dl-ocr" });
        else toast.error("OCR could not confirm DL. Review the document and extracted text.", { id: "dl-ocr" });
      } else {
        toast.error("Failed to verify DL", { id: "dl-ocr" });
      }
    } catch (error) {
      toast.error("Error occurred during DL verification", { id: "dl-ocr" });
    } finally {
      setIsVerifyingDl(false);
    }
  };

  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
  const [aadhaarOcrResult, setAadhaarOcrResult] = useState(null);

  const handleVerifyAadhaarOcr = async () => {
    try {
      setIsVerifyingAadhaar(true);
      toast.loading("Verifying Aadhaar via OCR...", { id: "aadhaar-ocr" });
      const result = await verifyAadhaarOcrApi(id);
      if (result?.success) {
        setAadhaarOcrResult({ matched: result.matched, text: result.text });
        if (result.matched) toast.success("Aadhaar number found in image", { id: "aadhaar-ocr" });
        else toast.error("OCR could not confirm Aadhaar. Review the document and extracted text.", { id: "aadhaar-ocr" });
      } else {
        toast.error("Failed to verify Aadhaar", { id: "aadhaar-ocr" });
      }
    } catch (error) {
      toast.error("Error occurred during Aadhaar verification", { id: "aadhaar-ocr" });
    } finally {
      setIsVerifyingAadhaar(false);
    }
  };

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
  if (!driver) return <div className="card py-14 text-center text-slate-400">No Driver Found</div>;

  return (
    <div className="page-shell">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Driver Details</h2>
          <p className="page-subtitle">Manage and view driver profile, documents, and banking.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-4 sm:p-5">
          <div className="rounded-xl bg-amber-500/10 p-3 text-gray-900 ring-1 ring-inset ring-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="detail-label">Driver Rating</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{driver.rating || "N/A"}</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4 sm:p-5">
          <div className="rounded-xl bg-slate-900/5 p-3 text-slate-700 ring-1 ring-inset ring-slate-900/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="detail-label">Total Rides</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{driver.totalRides || 0}</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4 sm:p-5">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="detail-label">Current Status</p>
            <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              <span className={`w-2.5 h-2.5 rounded-full ${driver.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}></span>
              {driver.isOnline ? "Online" : "Offline"}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* LEFT COLUMN: Profile & Info */}
        <div className="min-w-0 space-y-5 xl:col-span-1">
          {/* PROFILE CARD */}
          <div className="card card-pad flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={driver.profilePic || "https://via.placeholder.com/150"}
                alt="profile"
                className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-white sm:h-32 sm:w-32"
              />
              <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${driver.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </div>
            
            <h3 className="mt-4 break-words text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{driver.name} {driver.midName} {driver.lastName}</h3>
            <p className="mt-1 break-all text-sm text-slate-500">{driver.email}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{driver.phone}</p>
            
            <div className="mt-5 w-full border-t border-slate-200/70 pt-5">
              <div className="flex flex-col gap-3">
                <span className={`justify-center self-center px-4 py-1 text-sm ${
                  driver.isVerified ? "badge-success" : "badge-warning"
                }`}>
                  {driver.isVerified ? "✅ Verified Driver" : "⚠️ Pending Verification"}
                </span>
                <button
                  onClick={handleVerify}
                  className={`w-full ${
                    driver.isVerified
                      ? "btn-danger"
                      : "btn-primary"
                  }`}
                >
                  {driver.isVerified ? "Revoke Verification" : "Verify Driver Now"}
                </button>
              </div>
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="card card-pad">
            <h4 className="card-title mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Personal Information
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-slate-200/70 pb-2"><span className="text-slate-500">Gender</span> <span className="text-right font-semibold text-slate-800">{driver.gender || "N/A"}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-200/70 pb-2"><span className="text-slate-500">Alt Phone</span> <span className="text-right font-semibold text-slate-800">{driver.alternatePhone || "N/A"}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-200/70 pb-2"><span className="text-slate-500">Completed Rides</span> <span className="text-right font-semibold text-slate-800">{driver.completedRidesCount || 0}</span></div>
            </div>
            
            <h4 className="card-title mt-6 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Address
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="detail-label mb-1.5 block">Current Address</span>
                <p className="break-words rounded-xl bg-slate-900/[0.03] p-3 font-medium text-slate-800 ring-1 ring-inset ring-slate-900/5">{driver.currentAddress || "Not Provided"}</p>
              </div>
              <div>
                <span className="detail-label mb-1.5 block">Permanent Address</span>
                <p className="break-words rounded-xl bg-slate-900/[0.03] p-3 font-medium text-slate-800 ring-1 ring-inset ring-slate-900/5">{driver.permanentAddress || "Not Provided"}</p>
              </div>
            </div>
          </div>
          
          {/* VEHICLE PREFERENCES */}
          <div className="card card-pad">
             <h4 className="card-title mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4l1-1h12l1 1v4.5l-1 1h-2v3.5l1 1v1.5h-10v-1.5l1-1v-3.5h-2l-1-1V4z" />
              </svg>
              Vehicle Assignment
            </h4>
            
            <div className="mb-4">
              <span className="detail-label">Categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {driver.VehiclePreferenceCategory?.length > 0 ? driver.VehiclePreferenceCategory.map((item) => (
                  <span key={item._id} className="badge-success">
                    {item.name}
                  </span>
                )) : <span className="text-sm text-slate-400">None</span>}
              </div>
            </div>

            <div>
              <span className="detail-label">Preferences</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {driver.vechiclePreferenceSchema?.length > 0 ? driver.vechiclePreferenceSchema.map((item) => (
                  <span key={item._id} className="badge-neutral">
                    {item.name}
                  </span>
                )) : <span className="text-sm text-slate-400">None</span>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Documents & Banking */}
        <div className="min-w-0 space-y-5 xl:col-span-2">
          {/* BANK DETAILS */}
          <div className="card card-pad">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="card-title flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Bank Details & Payout
              </h4>
              <div className="flex flex-wrap gap-2">
                {bankDetails && (
                  <button
                    onClick={handleReverifyBank}
                    disabled={bankLoading}
                    className="btn-secondary"
                  >
                    {bankLoading ? "Verifying..." : "Reverify IFSC"}
                  </button>
                )}
                <button
                  onClick={() => setBankModalOpen(true)}
                  className="btn-primary"
                >
                  {bankDetails ? "Update Bank" : "Add Bank"}
                </button>
              </div>
            </div>

            {bankLoading && !bankDetails ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div></div>
            ) : bankDetails ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl bg-slate-900/[0.03] p-4 ring-1 ring-inset ring-slate-900/5 sm:p-5 md:grid-cols-2">
                <div>
                  <p className="detail-label mb-1">Account Holder</p>
                  <p className="detail-value mt-0">{bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="detail-label mb-1">Account Number</p>
                  <div className="flex items-center gap-2">
                    <p className="break-all font-mono text-sm font-semibold tracking-wide text-slate-800">{bankDetails.accountNumber}</p>
                    <button onClick={() => { navigator.clipboard.writeText(bankDetails.accountNumber); toast.success("Copied!"); }} className="btn-icon h-7 w-7 shrink-0" title="Copy">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="detail-label mb-1">IFSC Code</p>
                  <p className="detail-value mt-0 uppercase">{bankDetails.ifscCode}</p>
                </div>
                <div>
                  <p className="detail-label mb-1">Verification Status</p>
                  <span className={`${bankDetails.isVerified ? 'badge-success' : 'badge-danger'}`}>
                    {bankDetails.isVerified ? "VERIFIED ✅" : "PENDING ❌"}
                  </span>
                </div>
                {bankDetails.bankName && (
                  <div>
                    <p className="detail-label mb-1">Bank Name</p>
                    <p className="detail-value mt-0">{bankDetails.bankName} {bankDetails.branchName && `(${bankDetails.branchName})`}</p>
                  </div>
                )}
                {bankDetails.upiId && (
                  <div>
                    <p className="detail-label mb-1">UPI ID</p>
                    <p className="detail-value mt-0">{bankDetails.upiId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-4 rounded-2xl bg-amber-500/10 p-4 ring-1 ring-inset ring-amber-500/25 sm:p-5">
                <div className="mt-0.5 shrink-0 rounded-xl bg-amber-500/15 p-2 text-amber-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-base font-bold text-amber-800">Bank Details Missing</h5>
                  <p className="text-amber-700 text-sm mt-1">This driver cannot receive payouts until their bank account or UPI details are added and verified. Please add the details using the button above.</p>
                </div>
              </div>
            )}
          </div>

          {/* DOCUMENTS GRID */}
          <div className="card card-pad">
             <h4 className="card-title mb-5 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Identity & Documents
              </h4>
              
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              
              {/* License Card */}
              <div className="rounded-2xl bg-slate-900/[0.03] p-4 ring-1 ring-inset ring-slate-900/5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h5 className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
                      Driving License
                      {driver.licensePhoto && driver.licenseNumber && (
                        <button
                          onClick={handleVerifyDlOcr}
                          disabled={isVerifyingDl}
                          className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-gray-400 hover:text-slate-900 disabled:opacity-50"
                        >
                          {isVerifyingDl ? "Verifying..." : "Verify OCR"}
                        </button>
                      )}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{driver.licenseNumber || "N/A"}</p>
                    <OcrResult result={dlOcrResult} />
                    <p className="text-xs text-slate-500 mt-1">Exp: {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <span className="badge-neutral shrink-0">DL</span>
                </div>
                {driver.licensePhoto ? (
                  <div className="relative group h-32 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5">
                    <img src={driver.licensePhoto} alt="License" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.licensePhoto); setPreviewImageName(`driver-license-${id}.jpg`); }}>
                      <button className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                      </button>
                    </div>
                  </div>
                ) : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-400">No Document</div>}
              </div>

              {/* Police Verification Card */}
              <div className="rounded-2xl bg-slate-900/[0.03] p-4 ring-1 ring-inset ring-slate-900/5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-slate-800">Police Verification</h5>
                    <p className="text-xs text-slate-500 mt-1">Exp: {driver.policeVerificationExpiry ? new Date(driver.policeVerificationExpiry).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <span className="badge-neutral shrink-0">PV</span>
                </div>
                {driver.policeVerificationPhoto ? (
                  <div className="relative group h-32 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5">
                    <img src={driver.policeVerificationPhoto} alt="Police" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.policeVerificationPhoto); setPreviewImageName(`driver-pv-${id}.jpg`); }}>
                      <button className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                      </button>
                    </div>
                  </div>
                ) : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-400">No Document</div>}
              </div>

              {/* Aadhaar Card */}
              <div className="rounded-2xl bg-slate-900/[0.03] p-4 ring-1 ring-inset ring-slate-900/5 md:col-span-2">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h5 className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
                      Aadhaar Card
                      {driver.adhaarFrontPhoto && driver.adhaarNumber && (
                        <button
                          onClick={handleVerifyAadhaarOcr}
                          disabled={isVerifyingAadhaar}
                          className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-gray-400 hover:text-slate-900 disabled:opacity-50"
                        >
                          {isVerifyingAadhaar ? "Verifying..." : "Verify OCR"}
                        </button>
                      )}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 font-mono tracking-wide">{driver.adhaarNumber || "N/A"}</p>
                    <OcrResult result={aadhaarOcrResult} />
                  </div>
                  <span className="badge-neutral shrink-0">ID</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {driver.adhaarFrontPhoto ? (
                    <div className="relative group h-32 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5">
                      <img src={driver.adhaarFrontPhoto} alt="Aadhaar Front" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md">FRONT</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.adhaarFrontPhoto); setPreviewImageName(`driver-aadhaar-front-${id}.jpg`); }}>
                        <button className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-400">Front missing</div>}
                  
                  {driver.adhaarBackPhoto ? (
                    <div className="relative group h-32 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5">
                      <img src={driver.adhaarBackPhoto} alt="Aadhaar Back" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md">BACK</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.adhaarBackPhoto); setPreviewImageName(`driver-aadhaar-back-${id}.jpg`); }}>
                        <button className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-400">Back missing</div>}
                </div>
              </div>

              {/* PAN Card */}
              <div className="rounded-2xl bg-slate-900/[0.03] p-4 ring-1 ring-inset ring-slate-900/5 md:col-span-2">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h5 className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
                      PAN Card
                      {driver.panFrontPhoto && driver.panNumber && (
                        <button
                          onClick={handleVerifyPanOcr}
                          disabled={isVerifyingPan}
                          className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-gray-400 hover:text-slate-900 disabled:opacity-50"
                        >
                          {isVerifyingPan ? "Verifying..." : "Verify OCR"}
                        </button>
                      )}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 font-mono tracking-wide">{driver.panNumber || "N/A"}</p>
                    <OcrResult result={panOcrResult} />
                  </div>
                  <span className="badge-neutral shrink-0">TAX</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {driver.panFrontPhoto ? (
                    <div className="relative group h-32 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5">
                      <img src={driver.panFrontPhoto} alt="PAN Front" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md">FRONT</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.panFrontPhoto); setPreviewImageName(`driver-pan-front-${id}.jpg`); }}>
                        <button className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-400">Front missing</div>}
                  
                  {driver.panBackPhoto ? (
                     <div className="relative group h-32 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5">
                      <img src={driver.panBackPhoto} alt="PAN Back" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md">BACK</div>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setPreviewImage(driver.panBackPhoto); setPreviewImageName(`driver-pan-back-${id}.jpg`); }}>
                        <button className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Full Document
                        </button>
                      </div>
                    </div>
                  ) : <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-400">Back missing</div>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* BANK MODAL */}
      {bankModalOpen && (
        <div className="fixed inset-0 !m-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 sm:px-6">
               <h3 className="text-lg font-bold tracking-tight text-slate-900">{bankDetails ? "Update Bank Details" : "Add Bank Details"}</h3>
               <button onClick={() => setBankModalOpen(false)} className="btn-icon">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            <form onSubmit={handleBankSubmit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="field-label">Account Holder Name</label>
                <input 
                  type="text" 
                  required
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})}
                  className="field border"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="field-label">Account Number</label>
                <input 
                  type="text" 
                  required
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                  className="field border font-mono"
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="field-label">IFSC Code</label>
                <input 
                  type="text" 
                  required
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                  className="field border uppercase font-mono"
                  placeholder="e.g. SBIN0001234"
                />
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
                <button 
                  type="button" 
                  onClick={() => setBankModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={bankSubmitting}
                  className="btn-primary"
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
        <div className="fixed inset-0 !m-0 bg-black/95 flex flex-col items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-2 sm:top-6 sm:right-6 sm:gap-3">
            <button 
              onClick={() => downloadImage(previewImage, previewImageName)}
              className="btn-gold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download File
            </button>
            <button 
              onClick={() => { setPreviewImage(null); setPreviewImageName(""); }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Close
            </button>
          </div>
          <img src={previewImage} alt="Document Preview" className="mt-12 max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl sm:mt-0 sm:max-h-[85vh]" />
        </div>
      )}

    </div>
  );
}
