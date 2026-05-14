import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import { getEtsUserStopPagesByIdApi } from "../../Services/EtsUserStopPages";

const EtsUserStoppageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getEtsUserStopPagesByIdApi(id);

        if (res?.status) {
          setData(res.data);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* MAIN CARD */}
      <div className="bg-white p-6 rounded-xl shadow-xl mt-6">

        {/* USER CARD */}
        <div className="border p-4 rounded-xl mb-6 bg-blue-50">
          <h3 className="text-blue-600 font-semibold text-lg mb-3">
            User Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="font-medium">{data?.user?.name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{data?.user?.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Mobile</label>
              <p className="font-medium">{data?.user?.mobile}</p>
            </div>
          </div>
        </div>

        {/* ROUTE CARD */}
        <div className="border p-4 rounded-xl mb-6 bg-yellow-50">
          <h3 className="text-yellow-600 font-semibold text-lg mb-3">
            Route Details
          </h3>

          <div className="mb-4">
            <label className="text-sm text-gray-500">Route Name</label>
            <p className="font-medium">{data?.route?.name}</p>
          </div>

          {/* STOPPAGES */}
          <div>
            <label className="text-sm text-gray-500 block mb-2">
              Stoppages
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.route?.stoppages?.map((s) => (
                <div key={s._id} className="border p-3 rounded-lg bg-white">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.address}</p>
                  <p className="text-sm">Lat: {s.lat}</p>
                  <p className="text-sm">Lng: {s.lng}</p>
                  <p className="text-sm">Order: {s.order}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOARDING CARD */}
        <div className="border p-4 rounded-xl mb-6 bg-green-50">
          <h3 className="text-green-600 font-semibold text-lg mb-3">
            Boarding Stoppage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p>{data?.boardingStoppage?.name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Latitude</label>
              <p>{data?.boardingStoppage?.lat}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Longitude</label>
              <p>{data?.boardingStoppage?.lng}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p>{data?.boardingStoppage?.address}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Order</label>
              <p>{data?.boardingStoppage?.order}</p>
            </div>
          </div>
        </div>

        {/* DROPPING CARD */}
        <div className="border p-4 rounded-xl mb-6 bg-purple-50">
          <h3 className="text-purple-600 font-semibold text-lg mb-3">
            Dropping Stoppage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p>{data?.droppingStoppage?.name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Latitude</label>
              <p>{data?.droppingStoppage?.lat}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Longitude</label>
              <p>{data?.droppingStoppage?.lng}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p>{data?.droppingStoppage?.address}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Order</label>
              <p>{data?.droppingStoppage?.order}</p>
            </div>
          </div>
        </div>

        {/* STATUS CARD */}
        <div className="border p-4 rounded-xl bg-gray-100">
          <h3 className="font-semibold text-lg mb-3">Other Info</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className={data?.isActive ? "text-green-600" : "text-red-600"}>
                {data?.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Assigned At</label>
              <p>{new Date(data?.assignedAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Created At</label>
              <p>{new Date(data?.createdAt).toLocaleString()}</p>
            </div>

          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg"
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default EtsUserStoppageDetails;