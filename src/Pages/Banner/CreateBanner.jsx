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
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>

      <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Platform */}
          <label className="ml-2 mt-4 font-normal block">Platform:</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="">Select Platform</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="both">Both</option>
          </select>
          {apiError.platform && (
            <p className="text-red-500 text-sm ml-2">{apiError.platform}</p>
          )}

          {/* Type – NEW FIELD */}
          <label className="ml-2 mt-5 font-normal block">Banner For:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="user">User</option>
            <option value="driver">Driver</option>
          </select>
          {apiError.type && (
            <p className="text-red-500 text-sm ml-2">{apiError.type}</p>
          )}

          {/* Priority */}
          <label className="ml-2 mt-5 font-normal block">Priority:</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="number"
            name="priority"
            placeholder="Priority"
            value={formData.priority}
            onChange={handleChange}
          />
          {apiError.priority && (
            <p className="text-red-500 text-sm ml-2">{apiError.priority}</p>
          )}

          {/* Image Upload */}
          <label className="ml-2 mt-5 font-normal block">Banner Image:</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
            />
          )}
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
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
            <p className="text-red-500 text-sm ml-2">{apiError.image}</p>
          )}

          {/* Status */}
          <label className="ml-2 mt-5 font-normal block">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="">Select Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {apiError.status && (
            <p className="text-red-500 text-sm ml-2">{apiError.status}</p>
          )}

          {/* Submit */}
          <div className="flex justify-end items-center gap-4 mt-8">

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-3 px-6 rounded-2xl"
            >
              {loading ? "Creating..." : "Create Banner"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white py-3 px-6 rounded-2xl"
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
