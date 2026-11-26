import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { createBannnerApi } from "../../Services/BannerApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

const CreateAgency = () => {
  const [formData, setFormData] = useState({
    image: "",
    priority: "",
    platform: "",
    status: "",
    type: "user", // ← added with default "user"
  });

  const [apiMessage, setApiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, [name]: file });
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    const errors = {};

    if (!formData.platform.trim()) errors.platform = "Platform is required.";
    if (!formData.priority) errors.priority = "Priority is required.";
    if (!formData.image) errors.image = "Image is required.";
    if (!formData.status.trim()) errors.status = "Status is required.";
    if (!formData.type) errors.type = "Type is required."; // ← added

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const res = await createBannnerApi(formDataToSend);

      if (res.status) {
        navigate(-1);
        toast.success("Banner added successfully!");
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
      console.error("Error creating banner:", error);
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
          <h1 className="page-title">Create Banner</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Platform */}
          <div>
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

          {/* Type – NEW FIELD */}
          <div>
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

          {/* Priority */}
          <div>
          <label className="field-label">Priority:</label>
          <input
            className="field"
            type="number"
            name="priority"
            placeholder="Priority"
            value={formData.priority}
            onChange={handleChange}
          />
          {apiError.priority && (
            <p className="field-error">{apiError.priority}</p>
          )}
          </div>

          {/* Image Upload */}
          <div>
          <label className="field-label">Banner Image:</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mb-3 h-20 w-32 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
            />
          )}
          <label
            htmlFor="image-upload"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 text-sm font-medium text-slate-600 transition-colors hover:border-gray-400 hover:bg-white"
          >
            🖼️ Upload Image
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

          {/* Status */}
          <div>
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
          </div>

          {/* Submit */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row-reverse sm:justify-start">

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? "Creating..." : "Create Banner"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto"
            >
              Back
            </button>

          </div>
      
        </form>
      </div>
    </div>
  );
};

export default CreateAgency;
