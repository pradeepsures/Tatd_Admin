// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getVehicleBookingById } from "../../Services/VehicleApi";
// import Loader from "../../compoents/Loader";
// import Breaker from "../../compoents/Breaker";

// export default function VehicleBookingDetails() {
//   const { id } = useParams();

//   const [data, setData] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchDetails = async () => {
//     try {
//       setLoading(true);
//       const res = await getVehicleBookingById(id);

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
//           <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white px-4 py-2 rounded-lg flex gap-4 text-sm">

//             <span>Total: <b>{stats.totalBookings}</b></span>
//             <span>|</span>
//             <span className="text-yellow-300">On Trip: <b>{stats.onTripCount}</b></span>
//             <span>|</span>
//             <span className="text-green-300">Completed: <b>{stats.completedCount}</b></span>
//             <span>|</span>
//             <span className="text-red-300">Cancelled: <b>{stats.cancelledCount}</b></span>
//             <span>|</span>
//             <span className="text-orange-300">Pending Payment: <b>{stats.pendingPaymentCount}</b></span>

//           </div>
//         )}
//       </div>

//       {/* BOOKINGS LIST */}
//       <div className="grid gap-5">

    
//         {data.map((item) => (

//           <div
//             key={item._id}
//             className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition"
//           >

//             {/* TOP ROW */}
//             <div className="flex justify-between items-center mb-3">

//               <div>
//                 <h2 className="font-semibold text-lg text-gray-800">
//                   {item.bookingNumber}
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   {item.createdAtIST}
//                 </p>
//               </div>

//               <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                 {item.tripStatus}
//               </span>

//             </div>

//             {/* USER + DRIVER */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

//               <div>
//                 <p className="text-xs text-gray-500">User</p>
//                 <p className="font-medium">{item.user?.name}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-gray-500">Driver</p>
//                 <p className="font-medium">{item.driver?.name || "Not Assigned"}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-gray-500">Segment</p>
//                 <p className="font-medium">{item.segment?.name}</p>
//               </div>

//             </div>

//             {/* LOCATIONS */}
//             <div className="mb-4">

//               <p className="text-xs text-gray-500">Pickup</p>
//               <p className="text-sm">{item.pickup?.address}</p>

//               <p className="text-xs text-gray-500 mt-2">Drop</p>
//               <p className="text-sm">{item.dropoff?.address}</p>

//             </div>

//             {/* DETAILS */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

//               <div>
//                 <p className="text-gray-500 text-xs">Fare</p>
//                 <p className="font-medium">₹ {item.estimatedFare}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500 text-xs">Payment</p>
//                 <p className="font-medium">{item.paymentStatus}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500 text-xs">Assignment</p>
//                 <p className="font-medium">{item.assignmentStatus}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500 text-xs">Booking Type</p>
//                 <p className="font-medium">{item.bookingType}</p>
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
import { getVehicleBookingById } from "../../Services/VehicleApi";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

export default function VehicleBookingDetails() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getVehicleBookingById(id);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      case "in_progress":
        return "badge-warning";
      case "not_started":
        return "badge-neutral";
      default:
        return "badge-info";
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Breaker />

        {/* STATS */}
        {stats && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="badge-neutral !px-3 !py-1">Total: <b>{stats.totalBookings}</b></span>
            <span className="badge-warning !px-3 !py-1">On Trip: <b>{stats.onTripCount}</b></span>
            <span className="badge-success !px-3 !py-1">Completed: <b>{stats.completedCount}</b></span>
            <span className="badge-danger !px-3 !py-1">Cancelled: <b>{stats.cancelledCount}</b></span>
            <span className="badge-info !px-3 !py-1">Pending: <b>{stats.pendingPaymentCount}</b></span>
          </div>
        )}
      </div>

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="card py-14 text-center text-slate-400">
          No bookings found
        </div>
      )}

      {/* TABLE */}
      <div className="card overflow-x-auto">

        <table className="min-w-[960px] w-full text-left text-sm">
          
          {/* HEADER */}
          <thead className="border-b border-[#c99a2e]/40 bg-[#171b25] text-[11px] font-semibold uppercase tracking-wider text-white/75">
            <tr>
              <th className="whitespace-nowrap px-4 py-3.5">Booking</th>
              <th className="whitespace-nowrap px-4 py-3.5">User</th>
              <th className="whitespace-nowrap px-4 py-3.5">Driver</th>
              <th className="whitespace-nowrap px-4 py-3.5">Route</th>
              <th className="whitespace-nowrap px-4 py-3.5">Fare</th>
              <th className="whitespace-nowrap px-4 py-3.5">Payment</th>
              <th className="whitespace-nowrap px-4 py-3.5">Trip</th>
              <th className="whitespace-nowrap px-4 py-3.5">Schedule</th>
              <th className="whitespace-nowrap px-4 py-3.5">Status</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-100 text-slate-700">

            {data.map((item) => (
              <tr key={item._id} className="transition odd:bg-white/40 hover:bg-gray-50">

                {/* BOOKING */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">
                    {item.bookingNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.createdAtIST}
                  </div>
                </td>

                {/* USER */}
                <td className="px-4 py-3">
                  {item.user?.name || "—"}
                </td>

                {/* DRIVER */}
                <td className="px-4 py-3">
                  <div>{item.driver?.name || "Not Assigned"}</div>
                  <div className="text-xs text-slate-500">
                    {item.driver?.phone || ""}
                  </div>
                </td>

                {/* ROUTE */}
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-500">From:</div>
                  <div>{item.pickup?.address}</div>

                  <div className="text-xs text-slate-500 mt-1">To:</div>
                  <div>{item.dropoff?.address}</div>
                </td>

                {/* FARE */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">₹ {item.estimatedFare}</div>
                  {/* <div className="text-xs text-slate-500">
                    Paid: ₹ {item.prepaidAmount}
                  </div> */}
                </td>

                {/* PAYMENT */}
                <td className="px-4 py-3 capitalize">
                  {item.paymentStatus}
                </td>

                {/* TRIP */}
                <td className="px-4 py-3 text-xs">
                  <div>{item.estimatedKm || "—"}km</div>
                  <div>{item.estimatedMins || "—"}mins</div>
                </td>

                {/* SCHEDULE */}
                <td className="px-4 py-3 text-xs">
                  <div>{item.scheduledAtIST || "—"}</div>
                  <div className="text-slate-400">
                    {item.bookingType}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <span className={`capitalize ${getStatusColor(item.tripStatus)}`}>
                    {item.tripStatus}
                  </span>

                  <div className="text-xs text-slate-500 mt-1">
                    {item.assignmentStatus}
                  </div>
                </td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}