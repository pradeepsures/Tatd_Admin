import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { createSegmentApi } from "../../Services/SegmentApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

const CreateSegment = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxCapacity: "",
    image: null, // will be File object
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image: file });
    }
  };

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    // Basic client-side validation
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (!formData.maxCapacity || isNaN(formData.maxCapacity) || Number(formData.maxCapacity) <= 0) {
      errors.maxCapacity = "Valid max capacity (number > 0) is required.";
    }
    if (!formData.image) errors.image = "Image is required.";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);
      dataToSend.append("maxCapacity", formData.maxCapacity);
      dataToSend.append("image", formData.image);

      const res = await createSegmentApi(dataToSend);

      if (res?.status) {
        toast.success("Segment created successfully!");
        navigate(-1); // or navigate("/segmentlist") if you prefer
      } else {
        const errorMsg = res?.message || res?.error?.message || "Failed to create segment";
        toast.error(errorMsg);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong!";
      console.error("Error creating segment:", error);
      toast.error(errMsg);
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

      <div className="ml-5 mt-8 bg-white p-6 w-full rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <label className="ml-2 mt-4 font-normal block">Segment Name:</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            name="name"
            placeholder="Enter segment name (e.g. Economy, Luxury)"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && (
            <p className="text-red-500 text-sm ml-2">{apiError.name}</p>
          )}

          {/* Description */}
          <label className="ml-2 mt-5 font-normal block">Description:</label>
          <textarea
            className="w-full h-24 mb-1 border rounded-xl pl-4 pt-2 border-gray-500 resize-none"
            name="description"
            placeholder="Brief description of this segment..."
            value={formData.description}
            onChange={handleChange}
          />
          {apiError.description && (
            <p className="text-red-500 text-sm ml-2">{apiError.description}</p>
          )}

          {/* Max Capacity */}
          <label className="ml-2 mt-5 font-normal block">Max Capacity (seats):</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="number"
            name="maxCapacity"
            placeholder="e.g. 4, 5, 7"
            min="1"
            value={formData.maxCapacity}
            onChange={handleChange}
          />
          {apiError.maxCapacity && (
            <p className="text-red-500 text-sm ml-2">{apiError.maxCapacity}</p>
          )}

          {/* Image Upload */}
          <label className="ml-2 mt-5 font-normal block">Segment Image:</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-32 object-cover rounded mt-2 mb-3 ml-2 border border-gray-300 shadow-sm"
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
            accept="image/*"
            onChange={handleImageChange}
          />
          {apiError.image && (
            <p className="text-red-500 text-sm ml-2">{apiError.image}</p>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-6">

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2 px-6 rounded-xl font-medium"
            >
              {loading ? "Creating..." : "Create Segment"}
            </button>

            {/* BACK */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-700 text-white py-2 px-6 rounded-xl font-medium"
            >
              Back
            </button>

            {/* CLEAR */}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  name: "",
                  description: "",
                  maxCapacity: "",
                  image: null,
                })
              }
              className="bg-gray-500 text-white py-2 px-6 rounded-xl font-medium"
            >
              Clear
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSegment;