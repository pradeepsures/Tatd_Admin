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
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card card-pad text-center text-rose-600 font-medium">
          {error}
        </div>
      </div>
    );
  }

  const handleBackClick = () => navigate(-1);

  return (
    <div className="page-shell">
      <Breaker />
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="page-header">
          <div>
            <p className="section-label">Banner</p>
            <h1 className="page-title">
              Banner <span className="text-gray-900">Overview</span>
            </h1>
          </div>
        </div>

        <div className="card p-5 sm:p-8 space-y-8">
          {/* Image */}
          <section>
            <h2 className="card-title mb-4">
              Banner Preview
            </h2>
            {bannerData.image ? (
              <img
                src={getImageUrl(bannerData.image)}
                alt={bannerData.title || "Banner"}
                className="w-full max-w-md h-48 object-cover rounded-xl shadow-sm ring-1 ring-black/5"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/256x160")
                }
              />
            ) : (
              <p className="text-sm text-slate-400">No image uploaded</p>
            )}
          </section>

          {/* Details */}
          <section>
            <h2 className="card-title mb-4">
              Banner Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <span className="badge-success">Active</span>
                  ) : (
                    <span className="badge-danger">Inactive</span>
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
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
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

// Reusable Detail Component
const Detail = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
    <p className="detail-label">{label}</p>
    <div className="detail-value">{value || "Not provided"}</div>
  </div>
);

export default BannerView;
