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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md text-center text-red-600 font-medium">
          {error}
        </div>
      </div>
    );
  }

  const handleBackClick = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Breaker />
      <div className="max-w-5xl mt-1 mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Segment <span className="text-red-500">Overview</span>
        </h1> */}

        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-10">
          {/* Image */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Segment Preview
            </h2>
            {segmentData.image ? (
              <img
                src={getImageUrl(segmentData.image)}
                alt={segmentData.name || "Segment"}
                className="w-full max-w-md h-48 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/256x160")
                }
              />
            ) : (
              <p className="text-sm text-gray-500">No image uploaded</p>
            )}
          </section>

          {/* Details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Segment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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
          <div className="flex justify-end">
            <button
              onClick={handleBackClick}
              className="bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-300"
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
  <div className={isFullWidth ? "md:col-span-2" : ""}>
    <p className="text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-gray-800">
      {value !== undefined && value !== null && value !== ""
        ? value
        : "Not provided"}
    </p>
  </div>
);

export default SegmentView;