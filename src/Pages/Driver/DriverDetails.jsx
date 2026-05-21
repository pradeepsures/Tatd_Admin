// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { getSingleDriver } from "../../Services/DriverApi";
// import Loader from "../../compoents/Loader";

// export default function DriverDetail() {

//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [driver, setDriver] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchDriver = async () => {

//     try {

//       setLoading(true);

//       const result = await getSingleDriver(id);

//       if (result?.status) {
//         setDriver(result.data);
//       }

//     } catch (err) {
//       toast.error("Failed to load chauffeur details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDriver();
//   }, []);

//   if (loading) return <Loader />;

//   if (!driver) return <div className="p-6">No Driver Found</div>;

//   return (

//     <div className="p-6 bg-gray-50 min-h-screen">

//       {/* HEADER */}

//       <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow flex justify-between items-center">

//         <h2 className="text-xl font-semibold">Driver Details</h2>

//         <button
//           onClick={() => navigate(-1)}
//           className="bg-white text-[#03045E] px-4 py-2 rounded-lg font-medium"
//         >
//           Back
//         </button>

//       </div>

//       {/* PROFILE */}

//       <div className="bg-white mt-6 p-6 rounded-xl shadow">

//         <div className="flex items-center gap-6">

//           <img
//             src={driver.profilePic}
//             alt="profile"
//             className="w-28 h-28 rounded-full object-cover border"
//           />

//           <div>

//             <h3 className="text-2xl font-semibold text-gray-800">
//               {driver.name}
//             </h3>

//             <p className="text-gray-600">{driver.email}</p>
//             <p className="text-gray-600">{driver.phone}</p>

//             <span className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${
//               driver.isVerified
//                 ? "bg-green-100 text-green-700"
//                 : "bg-yellow-100 text-yellow-700"
//             }`}>
//               {driver.isVerified ? "Verified Driver" : "Not Verified"}
//             </span>

//           </div>

//         </div>

//       </div>

//       {/* BASIC DETAILS */}

//       <div className="grid grid-cols-2 gap-6 mt-6">

//         <div className="bg-white p-5 rounded-xl shadow">

//           <h4 className="font-semibold text-lg mb-3 text-[#03045E]">
//             Personal Information
//           </h4>

//           <p><b> Full Name:</b>  {`${driver.name || ""} ${driver.midName || ""} ${driver.lastName || ""}`}</p>
//           <p><b>Email:</b> {driver.email}</p>
//           <p><b>Phone:</b> {driver.phone}</p>
//           <p><b>Alternate Phone:</b> {driver.alternatePhone}</p>

//         </div>

//         <div className="bg-white p-5 rounded-xl shadow">

//           <h4 className="font-semibold text-lg mb-3 text-[#03045E]">
//             Address
//           </h4>

//           <p><b>Permanent Address:</b> {driver.permanentAddress}</p>
//           <p><b>Current Address:</b> {driver.currentAddress}</p>

//           <p>
//             <b>Region:</b> {driver?.region?.name} ({driver?.region?.state})
//           </p>
//           <p><b>State:</b> {driver.state}</p>
//           <p><b>City:</b> {driver.city}</p>
//           <p><b>Pincode:</b> {driver.pincode}</p>
//           <p><b>Grade:</b> {driver.grade}</p>

//         </div>

//       </div>

//       {/* LICENSE */}

//       <div className="bg-white p-5 rounded-xl shadow mt-6">

//         <h4 className="font-semibold text-lg mb-4 text-[#03045E]">
//           License Details
//         </h4>

//         <p><b>License Number:</b> {driver.licenseNumber}</p>
//         <p><b>Expiry Date:</b> {new Date(driver.licenseExpiry).toDateString()}</p>

//         <img
//           src={driver.licensePhoto}
//           className="w-48 mt-4 rounded-lg border"
//         />

//       </div>

//       {/* AADHAR */}

//       <div className="bg-white p-5 rounded-xl shadow mt-6">

//         <h4 className="font-semibold text-lg mb-4 text-[#03045E]">
//           Aadhaar Details
//         </h4>

//         <p><b>Aadhaar Number:</b> {driver.adhaarNumber}</p>

//         <div className="flex gap-6 mt-3">

//           <img
//             src={driver.adhaarFrontPhoto}
//             className="w-48 rounded-lg border"
//           />

//           <img
//             src={driver.adhaarBackPhoto}
//             className="w-48 rounded-lg border"
//           />

//         </div>

//       </div>

//       {/* PAN */}

//       <div className="bg-white p-5 rounded-xl shadow mt-6">

//         <h4 className="font-semibold text-lg mb-4 text-[#03045E]">
//           PAN Details
//         </h4>

//         <p><b>PAN Number:</b> {driver.panNumber}</p>

//         <div className="flex gap-6 mt-3">

//           <img
//             src={driver.panFrontPhoto}
//             className="w-48 rounded-lg border"
//           />

//           <img
//             src={driver.panBackPhoto}
//             className="w-48 rounded-lg border"
//           />

//         </div>

//       </div>

//       {/* POLICE VERIFICATION */}

//       <div className="bg-white p-5 rounded-xl shadow mt-6">

//         <h4 className="font-semibold text-lg mb-4 text-[#03045E]">
//           Police Verification
//         </h4>

//         <p>
//           <b>Expiry Date:</b>{" "}
//           {new Date(driver.policeVerificationExpiry).toDateString()}
//         </p>

//         <img
//           src={driver.policeVerificationPhoto}
//           className="w-48 mt-3 rounded-lg border"
//         />

//       </div>

//       {/* DRIVER STATS */}

//       <div className="grid grid-cols-3 gap-6 mt-6">

//         <div className="bg-white p-5 rounded-xl shadow text-center">
//           <h5 className="text-gray-500">Rating</h5>
//           <p className="text-2xl font-semibold">{driver.rating}</p>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow text-center">
//           <h5 className="text-gray-500">Total Rides</h5>
//           <p className="text-2xl font-semibold">{driver.totalRides}</p>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow text-center">
//           <h5 className="text-gray-500">Online Status</h5>
//           <p className="text-2xl font-semibold">
//             {driver.isOnline ? "Online" : "Offline"}
//           </p>
//         </div>

//       </div>

//     </div>

//   );

// }

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getSingleDriver } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(false);

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

          <p><b>Full Name:</b> {driver.name} {driver.midName} {driver.lastName}</p>
          <p><b>Email:</b> {driver.email}</p>
          <p><b>Phone:</b> {driver.phone}</p>
          <p><b>Alt Phone:</b> {driver.alternatePhone}</p>
          <p><b>Gender:</b> {driver.gender}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h4 className="font-semibold text-lg mb-3">Address</h4>

          <p><b>Permanent:</b> {driver.permanentAddress}</p>
          <p><b>Current:</b> {driver.currentAddress}</p>
        </div>

      </div>

      {/* LICENSE */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">License</h4>

        <p><b>Number:</b> {driver.licenseNumber}</p>
        <p>
          <b>Expiry:</b>{" "}
          {driver.licenseExpiry
            ? new Date(driver.licenseExpiry).toDateString()
            : "N/A"}
        </p>

        <img src={driver.licensePhoto} className="w-48 mt-3 rounded border" />
      </div>

      {/* AADHAR */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">Aadhaar</h4>

        <p><b>Number:</b> {driver.adhaarNumber}</p>

        <div className="flex gap-4 mt-3">
          <img src={driver.adhaarFrontPhoto} className="w-48 border rounded" />
          <img src={driver.adhaarBackPhoto} className="w-48 border rounded" />
        </div>
      </div>

      {/* PAN */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">PAN</h4>

        <p><b>Number:</b> {driver.panNumber}</p>

        <div className="flex gap-4 mt-3">
          <img src={driver.panFrontPhoto} className="w-48 border rounded" />
          <img src={driver.panBackPhoto} className="w-48 border rounded" />
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

        <img src={driver.policeVerificationPhoto} className="w-48 mt-3 border rounded" />
      </div>

      {/* VEHICLE PREFERENCES */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h4 className="font-semibold mb-3">Vehicle Preferences</h4>

        <div className="flex flex-wrap gap-2">
          {driver.vechiclePreferenceSchema?.map((item) => (
            <span key={item._id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
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
            <span key={item._id} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
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