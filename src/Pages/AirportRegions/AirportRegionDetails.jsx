import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import { getSingleAirportRegion } from "../../Services/AirportRegionApi";

export default function AirportRegionView() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {

      setLoading(true);

      const res = await getSingleAirportRegion(id);

      if (res?.status) {
        setData(res.data);
      }

    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className="p-6">No Data Found</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <Breaker />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-gray-800 mt-5">
          Airport Region Details
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="bg-primary text-white border px-4 py-2 rounded-lg shadow hover:bg-gray-50"
        >
          ← Back
        </button>

      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Region Name</p>
          <p className="font-semibold">
            {data.name || "N/A"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm ${
            data.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {data.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Radius</p>
          <p className="font-semibold">
            {data.radiusMeters || "N/A"} m
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Created At</p>
          <p className="font-semibold text-sm">
            {data.createdAt
              ? new Date(data.createdAt).toLocaleString()
              : "N/A"}
          </p>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-6">

          {/* ADDRESS */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">
              Address
            </h3>
            <p className="text-gray-700">
              {data.address || "N/A"}
            </p>
          </div>

          {/* COORDINATES */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">
              Coordinates
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-sm text-gray-500">Latitude</p>
                <p className="font-semibold">
                  {data.centerLat ?? "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Longitude</p>
                <p className="font-semibold">
                  {data.centerLng ?? "N/A"}
                </p>
              </div>

            </div>
          </div>

          {/* GOOGLE MAP (OPTIONAL VIEW LINK) */}
          {/* <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">
              Map Location
            </h3>

            {data.centerLat && data.centerLng ? (
              <a
                href={`https://www.google.com/maps?q=${data.centerLat},${data.centerLng}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View on Google Maps
              </a>
            ) : (
              <p>N/A</p>
            )}

          </div> */}

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* CREATED BY */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="font-semibold mb-3">
              Created By
            </h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span>{data?.createdBy?.email || "N/A"}</span>
              </div>


            </div>

          </div>

          {/* META INFO */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="font-semibold mb-3">
              Meta Info
            </h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">Updated At</span>
                <span>
                  {data.updatedAt
                    ? new Date(data.updatedAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}