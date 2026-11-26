import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { getSegmentApi } from "../../Services/SegmentApi"; // ← your exported function
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getImageUrl } from "../../utils/imageUtils";

const SegmentView = () => {
  const { id } = useParams();
  const [segmentData, setSegmentData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSegmentData = async () => {
      try {
        setIsLoading(true);
        const response = await getSegmentApi(id);

        if (response?.status) {
          toast.success("Segment details loaded successfully");
          setSegmentData(response.data);
        } else {
          throw new Error(response?.message || "Failed to load segment");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Error: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegmentData();
  }, [id]);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="card card-pad text-center text-sm font-semibold text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  const handleBackClick = () => navigate(-1);

  return (
    <div className="page-shell">
      <Breaker />
      <div className="mx-auto w-full max-w-5xl">
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Segment <span className="text-red-500">Overview</span>
        </h1> */}

        <div className="card space-y-8 p-5 sm:p-8">
          {/* Image */}
          <section>
            <p className="section-label mb-3">
              Segment Preview
            </p>
            {segmentData.image ? (
              <img
                src={getImageUrl(segmentData.image)}
                alt={segmentData.name || "Segment"}
                className="h-48 w-full max-w-md rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/256x160")
                }
              />
            ) : (
              <p className="rounded-xl bg-slate-50 py-10 text-center text-sm text-slate-400 ring-1 ring-slate-900/5 sm:max-w-md">No image uploaded</p>
            )}
          </section>

          {/* Details */}
          <section>
            <h2 className="card-title mb-4 border-b border-slate-200/70 pb-3">
              Segment Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Detail label="Name" value={segmentData.name} />
              <Detail label="Max Capacity" value={segmentData.maxCapacity} />
              <Detail
                label="Description"
                value={segmentData.description}
                isFullWidth
              />
              <Detail
                label="Created On"
                value={
                  segmentData.createdAt
                    ? new Date(segmentData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : null
                }
              />
            </div>
          </section>

          {/* Action */}
          <div className="flex flex-col border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              onClick={handleBackClick}
              className="btn-secondary w-full sm:w-auto"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Detail Component (same as BannerView)
const Detail = ({ label, value, isFullWidth = false }) => (
  <div className={`rounded-xl bg-white/60 px-4 py-3 ring-1 ring-slate-900/5 ${isFullWidth ? "md:col-span-2" : ""}`}>
    <p className="detail-label">{label}</p>
    <p className="detail-value">
      {value !== undefined && value !== null && value !== ""
        ? value
        : "Not provided"}
    </p>
  </div>
);

export default SegmentView;