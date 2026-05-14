import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getShuttleRouteShiftAssignById } from "../../Services/ShuttleRouteShiftAssignApi";

const ShuttleRouteShiftAssignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getShuttleRouteShiftAssignById(id);
      if (res?.status) setData(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="m-3">
      <Breaker />

      <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl w-full">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Shuttle Assignment Details
          </h2>
        </div>

        {data ? (
          <div className="space-y-6">

            {/* ROUTE + SHIFT */}
            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-sm text-gray-500 mb-1">Route</p>
                <p className="text-lg font-semibold">
                  {data?.shuttleRoute?.name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-sm text-gray-500 mb-1">Shift</p>
                <p className="text-lg font-semibold">
                  {data?.shuttleRouteShift?.shiftName}
                </p>
              </div>

            </div>

            {/* DRIVER */}
            <div className="bg-blue-50 p-5 rounded-xl border">
              <h3 className="font-semibold mb-3 text-blue-700">
                Driver Details
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="font-medium">{data?.driver?.name}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-medium">{data?.driver?.phone}</p>
                </div>
              </div>
            </div>

            {/* VEHICLE */}
            <div className="bg-green-50 p-5 rounded-xl border">
              <h3 className="font-semibold mb-3 text-green-700">
                Vehicle Details
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <p className="text-gray-500 text-sm">Brand</p>
                  <p className="font-medium">{data?.vehicle?.brand}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Car Number</p>
                  <p className="font-medium">{data?.vehicle?.carNumber}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Model</p>
                  <p className="font-medium">{data?.vehicle?.model}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Color</p>
                  <p className="font-medium">{data?.vehicle?.color}</p>
                </div>

              </div>
            </div>

            {/* DATE + META */}
            <div className="grid md:grid-cols-3 gap-6">

              <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(data.date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {new Date(data.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">
                  {new Date(data.updatedAt).toLocaleString()}
                </p>
              </div>

            </div>

          </div>
        ) : (
          <p className="text-center text-gray-500">No Data Found</p>
        )}

        {/* BUTTON */}
        <div className="mt-8 flex gap-4">

          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl"
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShuttleRouteShiftAssignView;