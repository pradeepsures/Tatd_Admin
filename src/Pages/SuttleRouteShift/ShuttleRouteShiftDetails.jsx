import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getShuttleRouteShiftById } from "../../Services/SuttleRouteShiftApi";

const ShuttleRouteShiftDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [shift, setShift] = useState(null);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getShuttleRouteShiftById(id);

        if (res?.status) {
          setShift(res.data);
        }
      } catch {
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (!shift) return <p className="p-5">No Data Found</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* ✅ TOP DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl mb-4">
          <strong>{shift.shiftName}</strong>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <p className="text-gray-500 text-sm">Route Name</p>
            <p className="font-semibold">
              {shift.shuttleRoute?.name || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">GST</p>
            <p className="font-semibold">{shift.gst || 0}%</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <p
              className={
                shift.isActive
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {shift.isActive ? "Active" : "Inactive"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Total Shift Stoppages</p>
            <p className="font-semibold">
              {shift.stoppageTimes?.length || 0}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Created At</p>
            <p className="font-semibold">
              {new Date(shift.createdAt).toLocaleString()}
            </p>
          </div>

        </div>
      </div>

      {/* ✅ ROUTE STOPPAGES (BASE ROUTE) */}
      <h3 className="text-lg font-semibold mb-4">
        Route Stoppages
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {shift.shuttleRoute?.stoppages?.map((stop, index) => (
          <div
            key={stop._id}
            className="bg-white p-5 rounded-xl shadow"
          >
            <h4 className="font-bold mb-2">#{index + 1}</h4>

            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {stop.name}</p>
              <p><strong>Address:</strong> {stop.address}</p>
              <p><strong>Lat:</strong> {stop.lat}</p>
              <p><strong>Lng:</strong> {stop.lng}</p>
              <p><strong>Order:</strong> {stop.order}</p>
              <p>
                <strong>Status:</strong>{" "}
                {stop.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ SHIFT STOPPAGE TIMES */}
      <h3 className="text-lg font-semibold mb-4">
        Shift Stoppage Timings & Price
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shift.stoppageTimes?.map((stop, index) => (
          <div
            key={stop._id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
          >
            <h4 className="font-bold mb-2">#{index + 1}</h4>

            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {stop.name}</p>
              <p><strong>Address:</strong> {stop.address}</p>
              <p><strong>Lat:</strong> {stop.lat}</p>
              <p><strong>Lng:</strong> {stop.lng}</p>
              <p><strong>Order:</strong> {stop.order}</p>

              <p>
                <strong>Arrival:</strong> {stop.arrivalTime}
              </p>
              <p>
                <strong>Departure:</strong> {stop.departureTime}
              </p>

              <p className="text-green-600 font-semibold">
                ₹ {stop.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ BACK BUTTON */}
      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ShuttleRouteShiftDetails;