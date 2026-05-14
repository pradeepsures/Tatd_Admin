import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { getSegmentApi, updateSegmentApi } from "../../Services/SegmentApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

const UpdateSegment = () => {
  const { id } = useParams(); // segment id from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxCapacity: "",
    image: null, // will be File object if new image is selected
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // for initial data load
  const [apiError, setApiError] = useState({});
  const [imagePreview, setImagePreview] = useState(""); // for preview (old or new)

  // Fetch existing segment data
  useEffect(() => {
    const fetchSegment = async () => {
      try {
        setFetching(true);
        const res = await getSegmentApi(id);

        if (res?.status && res.data) {
          const segment = res.data;
          setFormData({
            name: segment.name || "",
            description: segment.description || "",
            maxCapacity: segment.maxCapacity || "",
            image: null, // keep null — we don't send old image unless changed
          });
          setImagePreview(segment.image ? segment.image : ""); // show old image
        } else {
          toast.error(res?.message || "Failed to load segment data");
        }
      } catch (err) {
        toast.error("Error loading segment");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchSegment();
  }, [id]);

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

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    // Client-side validation
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (!formData.maxCapacity || isNaN(formData.maxCapacity) || Number(formData.maxCapacity) <= 0) {
      errors.maxCapacity = "Valid max capacity (> 0) is required.";
    }
    // Image is optional on update — only required if no old image exists
    if (!formData.image && !imagePreview) {
      errors.image = "Image is required.";
    }

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

      // Only append image if a new one was selected
      if (formData.image) {
        dataToSend.append("image", formData.image);
      }

      const res = await updateSegmentApi({ id, data: dataToSend });

      if (res?.status) {
        toast.success("Segment updated successfully!");
        navigate(-1); // or "/segmentlist" or wherever your list is
      } else {
        const errorMsg = res?.message || "Failed to update segment";
        toast.error(errorMsg);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong!";
      toast.error(errMsg);
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader />;
  if (loading) return <Loader />;

  return (
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>

      <div className="ml-5 mt-8 bg-white p-6 w-full rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 ml-2">
          Update Segment
        </h2>

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
            🖼️ Upload New Image (optional)
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
          <div className="flex justify-end mt-8 gap-4"> 
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 px-6 rounded-2xl"
            >
              {loading ? "Updating..." : "Update Segment"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white py-3 px-6 rounded-2xl hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSegment;