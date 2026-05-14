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
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "not_started":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Breaker />

        {/* STATS */}
        {stats && (
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white px-5 py-3 rounded-lg flex flex-wrap gap-4 text-sm shadow">
            <span>Total: <b>{stats.totalBookings}</b></span>
            <span>|</span>
            <span className="text-yellow-300">On Trip: <b>{stats.onTripCount}</b></span>
            <span>|</span>
            <span className="text-green-300">Completed: <b>{stats.completedCount}</b></span>
            <span>|</span>
            <span className="text-red-300">Cancelled: <b>{stats.cancelledCount}</b></span>
            <span>|</span>
            <span className="text-orange-300">Pending: <b>{stats.pendingPaymentCount}</b></span>
          </div>
        )}
      </div>

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow">
          No bookings found
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="min-w-full text-sm text-left">
          
          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Fare</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Trip</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y">

            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition">

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
                  {item.user?.name || "—"}
                </td>

                {/* DRIVER */}
                <td className="px-4 py-3">
                  <div>{item.driver?.name || "Not Assigned"}</div>
                  <div className="text-xs text-gray-500">
                    {item.driver?.phone || ""}
                  </div>
                </td>

                {/* ROUTE */}
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500">From:</div>
                  <div>{item.pickup?.address}</div>

                  <div className="text-xs text-gray-500 mt-1">To:</div>
                  <div>{item.dropoff?.address}</div>
                </td>

                {/* FARE */}
                <td className="px-4 py-3">
                  <div>₹ {item.estimatedFare}</div>
                  {/* <div className="text-xs text-gray-500">
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
                  <div className="text-gray-400">
                    {item.bookingType}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.tripStatus)}`}>
                    {item.tripStatus}
                  </span>

                  <div className="text-xs text-gray-500 mt-1">
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