import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { getBannerApi } from "../../Services/BannerApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getImageUrl } from "../../utils/imageUtils";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BannerView = () => {
  const { id } = useParams();
  const [bannerData, setBannerData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        setIsLoading(true);
        const response = await getBannerApi(id);
        if (response?.status) {
          toast.success("Banner details loaded successfully");
          setBannerData(response.data);
        } else {
          throw new Error(response?.message || "Failed to load banner");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Error: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerData();
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Banner <span className="text-red-500">Overview</span>
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-10">
          {/* Image */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Banner Preview
            </h2>
            {bannerData.image ? (
              <img
                src={getImageUrl(bannerData.image)}
                alt={bannerData.title || "Banner"}
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
              Banner Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <Detail label="Type" value={bannerData.type} />
              <Detail label="Priority" value={bannerData.priority} />
              <Detail
                label="Platform"
                value={
                  bannerData.platform
                    ? bannerData.platform.charAt(0).toUpperCase() +
                      bannerData.platform.slice(1)
                    : null
                }
              />
              <Detail
                label="Status"
                value={
                  bannerData.status ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-red-600 font-medium">Inactive</span>
                  )
                }
              />
              <Detail
                label="Created On"
                value={
                  bannerData.createdAt
                    ? new Date(bannerData.createdAt).toLocaleDateString(
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

// Reusable Detail Component
const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-gray-800">{value || "Not provided"}</p>
  </div>
);

export default BannerView;
