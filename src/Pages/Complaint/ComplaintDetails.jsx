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
  if (!data) return <div className="py-14 text-center text-slate-400">No Data Found</div>;

  return (
    <div className="page-shell">

      <Breaker />

      {/* HEADER */}
      <div className="page-header">

        <div>
          <h2 className="page-title">
            Complaint Details
          </h2>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="btn-secondary w-full sm:w-auto"
        >
          ← Back
        </button>

      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="card p-4">
          <p className="detail-label">Ticket ID</p>
          <p className="detail-value">
            {showValue(data.ticketId)}
          </p>
        </div>

        <div className="card p-4">
          <p className="detail-label mb-2">Status</p>
          <span className={`capitalize 
            ${data.ticketStatus === "open"
              ? "badge-warning"
              : "badge-success"
            }`}>
            {showValue(data.ticketStatus)}
          </span>
        </div>

        <div className="card p-4">
          <p className="detail-label">Category</p>
          <p className="detail-value capitalize">
            {showValue(data.issueCategory)}
          </p>
        </div>

        <div className="card p-4">
          <p className="detail-label">Created At</p>
          <p className="detail-value">
            {data.createdAt
              ? new Date(data.createdAt).toLocaleString()
              : "N/A"}
          </p>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* LEFT SIDE */}
        <div className="space-y-5 lg:col-span-2">

          {/* DESCRIPTION */}
          <div className="card card-pad">
            <h3 className="card-title mb-3">
              Description
            </h3>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
              {showValue(data.description)}
            </p>
          </div>

          {/* IMAGES */}
          {data?.imageFiles?.length > 0 ? (
            <div className="card card-pad">
              <h3 className="card-title mb-4">
                Uploaded Images
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.imageFiles.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => window.open(img, "_blank")}
                    className="h-32 w-full cursor-pointer rounded-xl object-cover ring-1 ring-black/5 transition hover:opacity-90 sm:h-40"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="card py-14 text-center text-slate-400">
              No Images Available
            </div>
          )}

          {/* VIDEO */}
          {data?.videoFiles ? (
            <div className="card card-pad">
              <h3 className="card-title mb-4">
                Video
              </h3>

              <video
                src={data.videoFiles}
                controls
                className="w-full rounded-xl ring-1 ring-black/5"
              />
            </div>
          ) : (
            <div className="card py-14 text-center text-slate-400">
              No Video Available
            </div>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-5">

          {/* REPORTER CARD */}
          <div className="card card-pad text-center">

            <img
              src={data?.reporter?.profilePic || "/no-image.png"}
              className="mx-auto mb-3 h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
            />

            <h4 className="card-title">
              {showValue(data?.reporter?.name)}
            </h4>

            <p className="mt-0.5 break-all text-sm text-slate-500">
              {showValue(data?.reporter?.email)}
            </p>

          </div>

          {/* EXTRA INFO */}
          <div className="card card-pad">

            <h3 className="card-title mb-3 border-b border-slate-200/70 pb-3">
              Additional Info
            </h3>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Model</span>
                <span className="text-right font-semibold text-slate-800">{showValue(data.onModel)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Other Label</span>
                <span className="text-right font-semibold text-slate-800">{showValue(data.otherLabel)}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}