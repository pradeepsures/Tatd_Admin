import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getEtsRouteById } from "../../Services/EtsRouteApi";

const EtsRouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);

        const res = await getEtsRouteById(id);

        if (res?.status) {
          setRoute(res.data); // ✅ correct object
        }
      } catch (err) {
        toast.error("Failed to load route");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  if (loading) return <Loader />;
  if (!route) return <p className="p-5">No Data Found</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* ✅ TOP DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl mb-4">
          <strong>Route Name:</strong> {route.name || "N/A"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STATUS */}
          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <p className={route.isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {route.isActive ? "Active" : "Inactive"}
            </p>
          </div>

          {/* TOTAL STOPPAGES */}
          <div>
            <p className="text-gray-500 text-sm">Total Stoppages</p>
            <p className="font-semibold">{route.stoppages?.length || 0}</p>
          </div>

          {/* CREATED AT */}
          <div>
            <p className="text-gray-500 text-sm">Created At</p>
            <p className="font-semibold">{new Date(route.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ✅ ETS ROUTE ORIGINAL STOPPAGES */}
      <h3 className="text-lg font-semibold mb-4 mt-6">
        <strong>EtsRoute:</strong> Stoppage Timings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {route.stoppages?.map((stop, index) => (
          <div key={stop._id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-lg font-bold mb-2">#{index + 1}</h4>

            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {stop.name || "N/A"}</p>
              <p><strong>Address:</strong> {stop.address || "N/A"}</p>
              <p><strong>Latitude:</strong> {stop.lat || "N/A"}</p>
              <p><strong>Longitude:</strong> {stop.lng || "N/A"}</p>
              <p><strong>Order:</strong> {stop.order}</p>
              <p><strong>Distance:</strong> {stop.distance || 0} m</p>
            </div>

            <div className="mt-3">
              <span
                className={`px-3 py-1 text-xs rounded-full ${stop.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
              >
                {stop.isActive ? "Active" : "Inactive"}
              </span>
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

export default EtsRouteDetails;