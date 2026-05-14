import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import { getSingleComplaint } from "../../Services/ComplaintApi";

export default function ComplaintView() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ fallback helper
  const showValue = (value) => {
    return value ? value : "N/A";
  };

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const result = await getSingleComplaint(id);
      if (result?.status) setData(result.data);
    } catch {
      toast.error("Failed to fetch complaint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className="p-6">No Data Found</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <Breaker />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-2xl mt-5 font-bold text-gray-800">
            Complaint Details
          </h2>
        </div>

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
          <p className="text-sm text-gray-500">Ticket ID</p>
          <p className="font-semibold text-gray-800">
            {showValue(data.ticketId)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium 
            ${data.ticketStatus === "open"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
            }`}>
            {showValue(data.ticketStatus)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-semibold capitalize">
            {showValue(data.issueCategory)}
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

          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {showValue(data.description)}
            </p>
          </div>

          {/* IMAGES */}
          {data?.imageFiles?.length > 0 ? (
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4">
                Uploaded Images
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.imageFiles.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => window.open(img, "_blank")}
                    className="h-40 w-full object-cover rounded-lg border cursor-pointer hover:scale-105 transition"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No Images Available
            </div>
          )}

          {/* VIDEO */}
          {data?.videoFiles ? (
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4">
                Video
              </h3>

              <video
                src={data.videoFiles}
                controls
                className="w-full rounded-lg"
              />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No Video Available
            </div>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* REPORTER CARD */}
          <div className="bg-white p-6 rounded-xl shadow text-center">

            <img
              src={data?.reporter?.profilePic || "/no-image.png"}
              className="w-20 h-20 rounded-full mx-auto border mb-3"
            />

            <h4 className="font-semibold text-gray-800">
              {showValue(data?.reporter?.name)}
            </h4>

            <p className="text-sm text-gray-500">
              {showValue(data?.reporter?.email)}
            </p>

          </div>

          {/* EXTRA INFO */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="font-semibold mb-3">
              Additional Info
            </h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span>{showValue(data.onModel)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Other Label</span>
                <span>{showValue(data.otherLabel)}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}