import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateBannerApi, getBannerApi } from "../../Services/BannerApi";
import Breaker from "../../compoents/Breaker";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UpdateBanner = () => {
  const [formData, setFormData] = useState({
    image: null,
    priority: "",
    platform: "",
    status: "",
    type: "user", // ← added with default
  });

  const [apiMessage, setApiMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Banner ID:", id);
    if (id) {
      const fetchBanner = async () => {
        setLoading(true);
        try {
          const res = await getBannerApi(id);
          if (res.status) {
            toast.success("Banner fetched successfully!");
            const { image, priority, platform, status, type } = res.data;

            setFormData({
              image: null, // new upload only — old image stays in preview
              priority: priority?.toString() || "",
              platform: platform || "",
              status: status !== undefined ? status.toString() : "",
              type: type || "user", // ← added + fallback
            });

            if (image) {
              setImagePreview(`${image}`);
            }
          }
        } catch (err) {
          console.error("Failed to fetch banner data:", err);
          toast.error("Failed to load banner details");
        } finally {
          setLoading(false);
        }
      };
      fetchBanner();
    } else {
      console.error("Banner ID is missing");
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(files[0]);
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    const errors = {};

    if (!formData.priority) errors.priority = "Priority is required.";
    if (!formData.platform?.trim()) errors.platform = "Platform is required.";
    if (formData.status === "") errors.status = "Status is required.";
    if (!formData.type) errors.type = "Type is required."; // ← added

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          dataToSend.append(key, formData[key]);
        }
      });

      const res = await updateBannerApi({ id, data: dataToSend });
      if (res.status) {
        navigate(-1);
        toast.success("Banner updated successfully!");
      } else {
        const errorMessage =
          res?.error?.message || res?.message || "Something went wrong!";
        toast.error(errorMessage);
        setApiMessage(errorMessage);
      }
    } catch (error) {
      const catchErrorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Server error occurred";
      console.error("Error updating banner:", error);
      toast.error(catchErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card p-5 sm:p-8">
        <div className="mb-6 border-b border-slate-200/70 pb-5">
          <p className="section-label">Banner</p>
          <h1 className="page-title">Update Banner</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Priority */}
          <div>
          <label className="field-label">Priority:</label>
          <input
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="field"
            type="number"
            placeholder="Priority"
          />
          {apiError.priority && (
            <p className="field-error">{apiError.priority}</p>
          )}

          </div>
          <div>
          {/* Platform */}
          <label className="field-label">Platform:</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="field"
          >
            <option value="">Select Platform</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="both">Both</option>
          </select>
          {apiError.platform && (
            <p className="field-error">{apiError.platform}</p>
          )}

          </div>
          <div>
          {/* Type – same as create */}
          <label className="field-label">Banner For:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="field"
          >
            <option value="user">User</option>
            <option value="driver">Driver</option>
          </select>
          {apiError.type && (
            <p className="field-error">{apiError.type}</p>
          )}

          </div>
          <div>
          {/* Status */}
          <label className="field-label">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="field"
          >
            <option value="">Select Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {apiError.status && (
            <p className="field-error">{apiError.status}</p>
          )}

          </div>
          <div>
          {/* Image Upload */}
          <label className="field-label">Banner Image:</label>
          {imagePreview && (
            <img
              src={
                imagePreview.startsWith("https://") ||
                imagePreview.startsWith("http://")
                  ? imagePreview
                  : `${BASE_URL}/${imagePreview}`
              }
              alt="Preview"
              className="mb-3 h-20 w-32 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
            />
          )}
          <label
            htmlFor="image-upload"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 text-sm font-medium text-slate-600 transition-colors hover:border-gray-400 hover:bg-white"
          >
            🖼️ Upload / Replace Image
          </label>
          <input
            id="image-upload"
            className="hidden"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {apiError.image && (
            <p className="field-error">{apiError.image}</p>
          )}

          </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? "Updating..." : "Update Banner"}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBanner;
