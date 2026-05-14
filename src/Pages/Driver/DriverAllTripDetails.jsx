// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getDriverBooking } from "../../Services/DriverApi";
// import Loader from "../../compoents/Loader";
// import Breaker from "../../compoents/Breaker";

// export default function DriverBookingDetails() {
//   const { id } = useParams();

//   const [data, setData] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchDetails = async () => {
//     try {
//       setLoading(true);
//       const res = await getDriverBooking(id);

//       if (res?.status) {
//         setData(res.data || []);
//         setStats(res.stats || null);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDetails();
//   }, [id]);

//   if (loading) return <Loader />;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <Breaker />

//         {/* STATS */}
//         {stats && (
//           <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white px-4 py-2 rounded-lg flex flex-wrap gap-3 text-sm">

//             <span>Total: <b>{stats.totalBookings}</b></span>
//             <span>|</span>

//             <span className="text-yellow-300">
//               On Trip: <b>{stats.onTripCount}</b>
//             </span>
//             <span>|</span>

//             <span className="text-green-300">
//               Completed: <b>{stats.completedCount}</b>
//             </span>
//             <span>|</span>

//             <span className="text-red-300">
//               Cancelled: <b>{stats.cancelledCount}</b>
//             </span>
//             <span>|</span>

//             <span className="text-orange-300">
//               Pending: <b>{stats.pendingPaymentCount}</b>
//             </span>

//           </div>
//         )}
//       </div>

//       {/* NO DATA */}
//       {!loading && data.length === 0 && (
//         <div className="text-center py-20 text-gray-500 text-lg bg-white rounded-xl shadow">
//           No bookings found
//         </div>
//       )}

//       {/* BOOKINGS */}
//       <div className="grid gap-5">
//         {data.map((item) => (
//           <div
//             key={item._id}
//             className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition"
//           >

//             {/* TOP */}
//             <div className="flex justify-between items-center mb-3">
//               <div>
//                 <h2 className="font-semibold text-lg text-gray-800">
//                   {item.bookingNumber}
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   {item.createdAtIST}
//                 </p>
//               </div>

//               <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
//                 {item.tripStatus}
//               </span>
//             </div>

//             {/* USER + VEHICLE */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

//               <div>
//                 <p className="text-xs text-gray-500">User</p>
//                 <p className="font-medium">{item.user?.name || "—"}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-gray-500">Vehicle</p>
//                 <p className="font-medium">
//                   {item.vehicle?.brand} {item.vehicle?.model}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {item.vehicle?.carNumber}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs text-gray-500">Segment</p>
//                 <p className="font-medium">{item.segment?.name}</p>
//               </div>

//             </div>

//             {/* LOCATION */}
//             <div className="mb-4">

//               <p className="text-xs text-gray-500">Pickup</p>
//               <p className="text-sm">{item.pickup?.address}</p>

//               <p className="text-xs text-gray-500 mt-2">Drop</p>
//               <p className="text-sm">{item.dropoff?.address}</p>

//             </div>

//             {/* DETAILS GRID */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

//               <div>
//                 <p className="text-gray-500 text-xs">Fare</p>
//                 <p className="font-medium">₹ {item.estimatedFare}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500 text-xs">Payment</p>
//                 <p className="font-medium capitalize">{item.paymentStatus}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500 text-xs">Assignment</p>
//                 <p className="font-medium capitalize">{item.assignmentStatus}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500 text-xs">Booking Type</p>
//                 <p className="font-medium capitalize">{item.bookingType}</p>
//               </div>

//             </div>

//             {/* EXTRA INFO */}
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-xs text-gray-500">

//               <div>
//                 Scheduled: {item.scheduledAtIST || "—"}
//               </div>

//               <div>
//                 Trip Start: {item.tripStartAtIST || "—"}
//               </div>

//               <div>
//                 Trip End: {item.tripEndAtIST || "—"}
//               </div>

//             </div>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDriverBooking } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

export default function DriverBookingDetails() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getDriverBooking(id);

      if (res?.status) {
        setData(res.data || []);
        setStats(res.stats || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Breaker />

        {/* STATS */}
        {stats && (
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white px-4 py-2 rounded-lg flex flex-wrap gap-4 text-sm shadow">
            <span>Total: <b>{stats.totalBookings}</b></span>
            <span>On Trip: <b>{stats.onTripCount}</b></span>
            <span>Completed: <b>{stats.completedCount}</b></span>
            <span>Cancelled: <b>{stats.cancelledCount}</b></span>
            <span>Pending: <b>{stats.pendingPaymentCount}</b></span>
          </div>
        )}
      </div>

      {/* NO DATA */}
      {!loading && data.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-lg bg-white rounded-xl shadow">
          No bookings found
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Booking</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Fare</th>
              <th className="px-4 py-3 text-left">Trip</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Timeline</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y">

            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">

                {/* BOOKING */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-800">
                    {item.bookingNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.createdAtIST}
                  </div>
                </td>

                {/* USER */}
                <td className="px-4 py-3">
                  <div className="font-medium">{item.user?.name}</div>
                </td>

                {/* VEHICLE */}
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {item.vehicle?.brand} {item.vehicle?.model}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.vehicle?.carNumber}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {item.vehicle?.fuelType} / {item.vehicle?.color}
                  </div>
                </td>

                {/* ROUTE */}
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500">From:</div>
                  <div className="text-sm">{item.pickup?.address}</div>

                  <div className="text-xs text-gray-500 mt-1">To:</div>
                  <div className="text-sm">{item.dropoff?.address}</div>
                </td>

                {/* FARE */}
                <td className="px-4 py-3">
                  <div>₹ {item.estimatedFare}</div>
                  {/* <div className="text-xs text-gray-500">
                    Final: ₹ {item.fareBreakup?.final?.totalFare || 0}
                  </div> */}
                </td>

                {/* TRIP */}
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {item.estimatedKm || 0} km
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.estimatedMins || 0} mins
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize
                    ${
                      item.tripStatus === "completed"
                        ? "bg-green-100 text-green-700"
                        : item.tripStatus === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.tripStatus === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.tripStatus.replace("_", " ")}
                  </div>

                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {item.paymentStatus} | {item.assignmentStatus}
                  </div>
                </td>

                {/* TIMELINE */}
                <td className="px-4 py-3 text-xs text-gray-500">
                  <div>Sch: {item.scheduledAtIST || "—"}</div>
                  <div>Start: {item.tripStartAtIST || "—"}</div>
                  <div>End: {item.tripEndAtIST || "—"}</div>
                </td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}