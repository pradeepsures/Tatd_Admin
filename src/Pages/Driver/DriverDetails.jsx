import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getSingleDriver, updateDriver } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (id) fetchDriver();
  }, [id]);

  if (loading) return <Loader />;
  if (!driver) return <div className="p-6">No Driver Found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow flex justify-between items-center">
        <h2 className="text-xl font-semibold">Driver Details</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-white text-[#03045E] px-4 py-2 rounded-lg font-medium"
        >
          Back
        </button>
      </div>

      {/* PROFILE */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow">

        <div className="flex items-center gap-6">

          <img
            src={driver.profilePic}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border"
          />

          <div>

            <h3 className="text-2xl font-semibold text-gray-800">
              {driver.name}
            </h3>

            <p className="text-gray-600">{driver.email}</p>
            <p className="text-gray-600">{driver.phone}</p>

            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                driver.isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {driver.isVerified ? "Verified Driver" : "Not Verified"}
              </span>

              <button
                onClick={handleVerify}
                className={`px-4 py-1 text-sm font-medium rounded-lg text-white transition-colors ${
                  driver.isVerified
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {driver.isVerified ? "Revoke Verification" : "Verify Driver"}
              </button>
            </div>

          </div>

          <div>
            <h3 className="text-2xl font-semibold">{driver.name}</h3>
            <p>{driver.email}</p>
            <p>{driver.phone}</p>

            <span
              className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${
                driver.isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {driver.isVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* PERSONAL */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h4 className="font-semibold text-lg mb-3">Personal Info</h4>

          <p>
            <b>Full Name:</b> {driver.name} {driver.midName} {driver.lastName}
          </p>
          <p>
            <b>Email:</b> {driver.email}
          </p>
          <p>
            <b>Phone:</b> {driver.phone}
          </p>
          <p>
            <b>Alt Phone:</b> {driver.alternatePhone}
          </p>
          <p>
            <b>Gender:</b> {driver.gender}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h4 className="font-semibold text-lg mb-3">Address</h4>

          <p>
            <b>Permanent:</b> {driver.permanentAddress}
          </p>
          <p>
            <b>Current:</b> {driver.currentAddress}
          </p>
        </div>
      </div>

      {/* LICENSE */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">License</h4>

        <p>
          <b>Number:</b> {driver.licenseNumber}
        </p>
        <p>
          <b>Expiry:</b>{" "}
          {driver.licenseExpiry
            ? new Date(driver.licenseExpiry).toDateString()
            : "N/A"}
        </p>

        <div className="mt-3 max-w-max">
          <img
            src={driver.licensePhoto}
            alt="License"
            className="w-48 rounded border"
          />
          <button
            onClick={() =>
              downloadImage(
                driver.licensePhoto,
                `driver-license-${driver._id || id}.jpg`,
              )
            }
            className="mt-3 w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>

      {/* AADHAR */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">Aadhaar</h4>

        <p>
          <b>Number:</b> {driver.adhaarNumber}
        </p>

        <div className="flex flex-wrap gap-4 mt-3">
          <div className="max-w-max">
            <img
              src={driver.adhaarFrontPhoto}
              alt="Aadhaar Front"
              className="w-48 border rounded"
            />
            <button
              onClick={() =>
                downloadImage(
                  driver.adhaarFrontPhoto,
                  `driver-aadhaar-front-${driver._id || id}.jpg`,
                )
              }
              className="mt-3 w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700"
            >
              Download
            </button>
          </div>

          <div className="max-w-max">
            <img
              src={driver.adhaarBackPhoto}
              alt="Aadhaar Back"
              className="w-48 border rounded"
            />
            <button
              onClick={() =>
                downloadImage(
                  driver.adhaarBackPhoto,
                  `driver-aadhaar-back-${driver._id || id}.jpg`,
                )
              }
              className="mt-3 w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* PAN */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">PAN</h4>

        <p>
          <b>Number:</b> {driver.panNumber}
        </p>

        <div className="flex flex-wrap gap-4 mt-3">
          <div className="max-w-max">
            <img
              src={driver.panFrontPhoto}
              alt="PAN Front"
              className="w-48 border rounded"
            />
            <button
              onClick={() =>
                downloadImage(
                  driver.panFrontPhoto,
                  `driver-pan-front-${driver._id || id}.jpg`,
                )
              }
              className="mt-3 w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700"
            >
              Download
            </button>
          </div>

          <div className="max-w-max">
            <img
              src={driver.panBackPhoto}
              alt="PAN Back"
              className="w-48 border rounded"
            />
            <button
              onClick={() =>
                downloadImage(
                  driver.panBackPhoto,
                  `driver-pan-back-${driver._id || id}.jpg`,
                )
              }
              className="mt-3 w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* POLICE */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">Police Verification</h4>

        <p>
          <b>Expiry:</b>{" "}
          {driver.policeVerificationExpiry
            ? new Date(driver.policeVerificationExpiry).toDateString()
            : "N/A"}
        </p>

        <div className="mt-3 max-w-max">
          <img
            src={driver.policeVerificationPhoto}
            alt="Police Verification"
            className="w-48 rounded border"
          />
          <button
            onClick={() =>
              downloadImage(
                driver.policeVerificationPhoto,
                `driver-police-verification-${driver._id || id}.jpg`,
              )
            }
            className="mt-3 w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>

      {/* VEHICLE PREFERENCES */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">Vehicle Preferences</h4>

        <div className="flex flex-wrap gap-2">
          {driver.vechiclePreferenceSchema?.map((item) => (
            <span
              key={item._id}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORY */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">Vehicle Categories</h4>

        <div className="flex flex-wrap gap-2">
          {driver.VehiclePreferenceCategory?.map((item) => (
            <span
              key={item._id}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-5 shadow rounded text-center">
          <p>Rating</p>
          <h2 className="text-xl font-bold">{driver.rating}</h2>
        </div>

        <div className="bg-white p-5 shadow rounded text-center">
          <p>Total Rides</p>
          <h2 className="text-xl font-bold">{driver.totalRides}</h2>
        </div>

        <div className="bg-white p-5 shadow rounded text-center">
          <p>Status</p>
          <h2 className="text-xl font-bold">
            {driver.isOnline ? "Online" : "Offline"}
          </h2>
        </div>
      </div>
    </div>
  );
}
