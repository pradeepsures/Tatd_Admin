// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// import Breaker from "../../compoents/Breaker";
// import Loader from "../../compoents/Loader";

// import { getHourlyBookingById } from "../../Services/HourlyBookingApi";

// export default function HourlyBookingDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchDetails = async () => {
//     try {
//       setLoading(true);

//       const res = await getHourlyBookingById(id);

//       if (res?.status) setData(res.data);
//     } catch (err) {
//       toast.error("Failed to load booking details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) fetchDetails();
//   }, [id]);

//   if (loading) return <Loader />;
//   if (!data) return null;

//   // ─────────────────────────────
//   // HELPERS
//   // ─────────────────────────────
//   const formatLabel = (key) =>
//     key
//       .replace(/_/g, " ")
//       .replace(/-/g, " ")
//       .replace(/\b\w/g, (c) => c.toUpperCase());

//   const formatValue = (value) => {
//     if (typeof value === "string") {
//       return value.replace(/_/g, " ").replace(/-/g, " ");
//     }
//     return value;
//   };

//   const cardClass =
//     "bg-white shadow-md rounded-xl p-5 mb-4 border border-gray-100";

//   const renderField = (label, value) => {
//     if (value === null || value === undefined || value === "") return null;

//     return (
//       <div>
//         <div className="text-gray-500 text-xs">
//           {formatLabel(label)}
//         </div>
//         <div className="text-sm font-semibold text-gray-800 break-words">
//           {formatValue(String(value))}
//         </div>
//       </div>
//     );
//   };

//   const renderObject = (obj) => {
//     if (!obj) return null;

//     return Object.entries(obj).map(([key, value]) => {
//       if (value === null || value === undefined || typeof value === "object")
//         return null;

//       return (
//         <div key={key}>
//           <div className="text-gray-500 text-xs">{formatLabel(key)}</div>
//           <div className="text-sm font-semibold text-gray-800">
//             {formatValue(String(value))}
//           </div>
//         </div>
//       );
//     });
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">

//       {/* HEADER */}
//       <div className="mb-4">
//         <Breaker />

//         <button
//           onClick={() => navigate(-1)}
//           className="mt-3 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
//         >
//           ← Back
//         </button>
//       </div>

//       {/* BOOKING INFO (ALL MAIN DATA HERE) */}
//       <div className={cardClass}>
//         <h2 className="text-lg font-bold mb-3">Booking Info</h2>

//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

//           {renderField("bookingNumber", data.bookingNumber)}
//           {renderField("tripType", data.tripType)}
//           {renderField("overallStatus", data.overallStatus)}
//           {renderField("tripStatus", data.tripStatus)}
//           {renderField("paymentStatus", data.paymentStatus)}
//           {renderField("assignmentStatus", data.assignmentStatus)}

//           {renderField("tripStartOtp", data.tripStartOtp)}
//           {renderField("tripEndOtp", data.tripEndOtp)}

//           {/* ROUTE MOVED HERE */}
//           {renderField("pickup", data.pickup?.address)}
//           {renderField("drop", data.dropoff?.address)}
//         </div>
//       </div>

//       {/* USER */}
//       <div className={cardClass}>
//         <h2 className="text-lg font-bold mb-3">User Info</h2>

//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//           {renderField("name", data.user?.name)}
//           {renderField("email", data.user?.email)}
//           {renderField("travellerPhone", data.travellerPhone)}
//         </div>
//       </div>

//       {/* VEHICLE */}
//       {data.vechiclePreferenceCategory && (
//         <div className={cardClass}>
//           <h2 className="text-lg font-bold mb-3">Vehicle Preference</h2>

//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="space-y-2">
//               {renderField("category", data.vechiclePreferenceCategory?.name)}
//               {renderField(
//                 "vehicleName",
//                 data.vechiclePreferenceCategory?.vehiclePreference?.name
//               )}
//               {renderField("status", data.vechiclePreferenceCategory?.status)}
//             </div>

//             {data.vechiclePreferenceCategory?.vehiclePreference?.image && (
//               <img
//                 src={
//                   data.vechiclePreferenceCategory.vehiclePreference.image
//                 }
//                 alt="vehicle"
//                 className="w-32 h-32 object-contain rounded-lg border"
//               />
//             )}
//           </div>
//         </div>
//       )}

//       {/* PRICING */}
//       {data.pricingSnapshot && (
//         <div className={cardClass}>
//           <h2 className="text-lg font-bold mb-3">Pricing Snapshot</h2>

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {renderObject(data.pricingSnapshot)}
//           </div>
//         </div>
//       )}

//       {/* FARE BREAKUP (4 COLUMN) */}
//       {data.fareBreakup?.estimated && (
//         <div className={cardClass}>
//           <h2 className="text-lg font-bold mb-3">Fare Breakup (Estimated)</h2>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {renderObject(data.fareBreakup.estimated)}
//           </div>
//         </div>
//       )}

//       {/* FINAL FARE (optional) */}
//       {data.fareBreakup?.final && (
//         <div className={cardClass}>
//           <h2 className="text-lg font-bold mb-3">Fare Breakup (Final)</h2>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {renderObject(data.fareBreakup.final)}
//           </div>
//         </div>
//       )}

//       {/* SCHEDULE */}
//       {(data.scheduledAtIST || data.createdAtIST) && (
//         <div className={cardClass}>
//           <h2 className="text-lg font-bold mb-3">Schedule</h2>

//           <div className="grid grid-cols-2 gap-4">
//             {renderField("scheduledAt", data.scheduledAtIST)}
//             {renderField("createdAt", data.createdAtIST)}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Select } from "antd";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getHourlyBookingById,
  getUnassignedHourlyDrivers,
  assignHourlyDriver,
  reassignHourlyDriver,
} from "../../Services/HourlyBookingApi";

const { Option } = Select;

export default function HourlyBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [driverOptions, setDriverOptions] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driverSubmitting, setDriverSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getHourlyBookingById(id);

      if (res?.status) setData(res.data);
    } catch (err) {
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchUnassignedDrivers = async () => {
    try {
      const res = await getUnassignedHourlyDrivers({
        page: 1,
        limit: 100,
        bookingId: id,
      });

      if (res?.status) {
        setDriverOptions(res.data || []);
        if (!res.data?.length) {
          toast.error("No drivers available for assignment");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load driver list");
    }
  };

  const handleDriverAction = async () => {
    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    try {
      setDriverSubmitting(true);

      if (data?.assignmentStatus === "assigned") {
        await reassignHourlyDriver({ bookingId: id, driverId: selectedDriverId });
      } else {
        await assignHourlyDriver({ bookingId: id, driverId: selectedDriverId });
      }

      setDriverModalOpen(false);
      setSelectedDriverId("");
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setDriverSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return null;

  // ─────────────────────────────
  // FORMATTING HELPERS
  // ─────────────────────────────

  const formatText = (value) => {
    if (value === null || value === undefined) return "-";

    if (typeof value === "string") {
      return value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return String(value);
  };

  const formatLabel = (key) =>
    key
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const cardClass =
    "bg-white shadow-md rounded-xl p-5 mb-4 border border-gray-100";

  const renderField = (label, value) => {
    if (value === null || value === undefined || value === "") return null;

    return (
      <div>
        <div className="text-gray-500 text-xs">
          {formatLabel(label)}
        </div>
        <div className="text-sm font-semibold text-gray-800 break-words">
          {formatText(value)}
        </div>
      </div>
    );
  };

  const renderObject = (obj) => {
    if (!obj) return null;

    return Object.entries(obj).map(([key, value]) => {
      if (value === null || value === undefined) return null;

      // skip nested objects
      if (typeof value === "object") return null;

      return (
        <div key={key}>
          <div className="text-gray-500 text-xs">
            {formatLabel(key)}
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {formatText(value)}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-4">
        <Breaker />

        <button
          onClick={() => navigate(-1)}
          className="mt-3 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
        >
          ← Back
        </button>

        <div className="mt-3 flex gap-3">
          <button
            onClick={async () => {
              setSelectedDriverId("");
              setDriverModalOpen(true);
              await fetchUnassignedDrivers();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            {data?.assignmentStatus === "assigned" ? "Reassign Driver" : "Assign Driver"}
          </button>
        </div>
      </div>

      {/* BOOKING INFO */}
      <div className={cardClass}>
        <h2 className="text-lg font-bold mb-3">Booking Info</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {renderField("bookingNumber", data.bookingNumber)}
          {renderField("tripType", data.tripType)}
          {renderField("overallStatus", data.overallStatus)}
          {renderField("tripStatus", data.tripStatus)}
          {renderField("paymentStatus", data.paymentStatus)}
          {renderField("assignmentStatus", data.assignmentStatus)}

          {renderField("tripStartOtp", data.tripStartOtp)}
          {renderField("tripEndOtp", data.tripEndOtp)}

          {/* ROUTE */}
          {renderField("pickupAddress", data.pickup?.address)}
          {renderField("dropoffAddress", data.dropoff?.address)}
        </div>
      </div>

      {/* USER */}
      <div className={cardClass}>
        <h2 className="text-lg font-bold mb-3">User Info</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {renderField("name", data.user?.name)}
          {renderField("email", data.user?.email)}
          {renderField("travellerPhone", data.travellerPhone)}
        </div>
      </div>

      {/* VEHICLE */}
      {data.vechiclePreferenceCategory && (
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-3">
            Vehicle Preference
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              {renderField("category", data.vechiclePreferenceCategory?.name)}
              {renderField(
                "vehicleName",
                data.vechiclePreferenceCategory?.vehiclePreference?.name
              )}
              {renderField("status", data.vechiclePreferenceCategory?.status)}
            </div>

            {data.vechiclePreferenceCategory?.vehiclePreference?.image && (
              <img
                src={
                  data.vechiclePreferenceCategory.vehiclePreference.image
                }
                alt="vehicle"
                className="w-32 h-32 object-contain rounded-lg border"
              />
            )}
          </div>
        </div>
      )}

      {/* PRICING */}
      {data.pricingSnapshot && (
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-3">Pricing Snapshot</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {renderObject(data.pricingSnapshot)}
          </div>
        </div>
      )}

      {/* FARE BREAKUP - ESTIMATED */}
      {data.fareBreakup?.estimated && (
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-3">
            Fare Breakup Estimated
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderObject(data.fareBreakup.estimated)}
          </div>
        </div>
      )}

      {/* FARE BREAKUP - FINAL */}
      {data.fareBreakup?.final && (
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-3">
            Fare Breakup Final
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderObject(data.fareBreakup.final)}
          </div>
        </div>
      )}

      <Modal
        title={data?.assignmentStatus === "assigned" ? "Reassign Driver" : "Assign Driver"}
        open={driverModalOpen}
        onCancel={() => setDriverModalOpen(false)}
        onOk={handleDriverAction}
        confirmLoading={driverSubmitting}
        okText={data?.assignmentStatus === "assigned" ? "Reassign Driver" : "Assign Driver"}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select a driver for this booking.</p>
          <Select
            showSearch
            placeholder="Select driver"
            className="w-full"
            value={selectedDriverId || undefined}
            onChange={(value) => setSelectedDriverId(value)}
            optionFilterProp="children"
          >
            {driverOptions.map((driver) => (
              <Option key={driver._id} value={driver._id}>
                {driver.name} {driver.phone ? `- ${driver.phone}` : ""}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>

      {/* SCHEDULE */}
      {(data.scheduledAtIST || data.createdAtIST) && (
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-3">Schedule</h2>

          <div className="grid grid-cols-2 gap-4">
            {renderField("scheduledAt", data.scheduledAtIST)}
            {renderField("createdAt", data.createdAtIST)}
          </div>
        </div>
      )}
    </div>
  );
}