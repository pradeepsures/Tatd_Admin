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
    <div className="page-shell">

      {/* HEADER */}
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Trips</h1>
          <p className="page-subtitle">All bookings handled by this driver</p>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="card px-4 py-3"><p className="detail-label">Total:</p><p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{stats.totalBookings}</p></div>
          <div className="card px-4 py-3"><p className="detail-label">On Trip:</p><p className="mt-1 text-xl font-semibold tracking-tight text-amber-600">{stats.onTripCount}</p></div>
          <div className="card px-4 py-3"><p className="detail-label">Completed:</p><p className="mt-1 text-xl font-semibold tracking-tight text-emerald-600">{stats.completedCount}</p></div>
          <div className="card px-4 py-3"><p className="detail-label">Cancelled:</p><p className="mt-1 text-xl font-semibold tracking-tight text-rose-600">{stats.cancelledCount}</p></div>
          <div className="card px-4 py-3"><p className="detail-label">Pending:</p><p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{stats.pendingPaymentCount}</p></div>
        </div>
      )}

      {/* NO DATA */}
      {!loading && data.length === 0 && (
        <div className="card py-14 text-center text-slate-400">
          No bookings found
        </div>
      )}

      {/* TABLE */}
      <div className="card overflow-x-auto">
        <table className="min-w-[960px] w-full text-sm">

          {/* HEADER */}
          <thead className="border-b border-[#c99a2e]/40 bg-[#171b25] text-[11px] font-semibold uppercase tracking-wider text-white/75">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Booking</th>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left font-semibold">Route</th>
              <th className="px-4 py-3 text-left font-semibold">Fare</th>
              <th className="px-4 py-3 text-left font-semibold">Trip</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Timeline</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-200/70 text-slate-700">

            {data.map((item) => (
              <tr key={item._id} className="transition-colors odd:bg-slate-50/40 hover:bg-amber-50/50">

                {/* BOOKING */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">
                    {item.bookingNumber}
                  </div>
                  <div className="mb-1.5 text-xs text-slate-500">
                    {item.createdAtIST}
                  </div>
                  {item.collectionType && (
                    <span className="badge-neutral text-[10px] uppercase tracking-wide">
                      {item.collectionType.replace("Booking", "").replace("booking", "standard")}
                    </span>
                  )}
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
                  <div className="text-xs text-slate-500">
                    {item.vehicle?.carNumber}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">
                    {item.vehicle?.fuelType} / {item.vehicle?.color}
                  </div>
                </td>

                {/* ROUTE */}
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-500">From:</div>
                  <div className="text-sm truncate max-w-[150px]" title={item.pickup?.address}>{item.pickup?.address || "N/A"}</div>

                  {item.dropoff?.address && (
                    <>
                      <div className="text-xs text-slate-500 mt-1">To:</div>
                      <div className="text-sm truncate max-w-[150px]" title={item.dropoff?.address}>{item.dropoff?.address}</div>
                    </>
                  )}
                </td>

                {/* FARE */}
                <td className="px-4 py-3">
                  <div>₹ {item.estimatedFare}</div>
                  {/* <div className="text-xs text-slate-500">
                    Final: ₹ {item.fareBreakup?.final?.totalFare || 0}
                  </div> */}
                </td>

                {/* TRIP */}
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {item.collectionType === "hourlyBooking" ? (
                      `${item.bookedHours || 0} Hours`
                    ) : item.collectionType === "weeklyBooking" || item.collectionType === "monthlyBooking" ? (
                      `${item.totalDays || 0} Days (${item.dailyHours || 0} hrs/day)`
                    ) : item.collectionType === "outstationBooking" ? (
                      `${item.totalDays || 0} Days`
                    ) : (
                      `${item.estimatedKm || 0} km`
                    )}
                  </div>
                  {(!["hourlyBooking", "weeklyBooking", "monthlyBooking", "outstationBooking"].includes(item.collectionType)) && (
                    <div className="text-xs text-slate-500">
                      {item.estimatedMins || 0} mins
                    </div>
                  )}
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <div
                    className={`whitespace-nowrap capitalize
                    ${
                      item.tripStatus === "completed"
                        ? "badge-success"
                        : item.tripStatus === "in_progress"
                        ? "badge-warning"
                        : item.tripStatus === "cancelled"
                        ? "badge-danger"
                        : "badge-info"
                    }`}
                  >
                    {item.tripStatus.replace("_", " ")}
                  </div>

                  <div className="text-xs text-slate-500 mt-1 capitalize">
                    {item.paymentStatus} | {item.assignmentStatus}
                  </div>
                </td>

                {/* TIMELINE */}
                <td className="whitespace-nowrap px-4 py-3 text-xs leading-5 text-slate-500">
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