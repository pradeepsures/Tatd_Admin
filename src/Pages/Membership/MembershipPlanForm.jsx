import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { Modal } from "antd";
import { TrashIcon, PlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";

// Helper function to create the cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        file.name = "cropped.jpg";
        resolve(file);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg");
  });
};

export default function MembershipPlanForm({ initialData = {}, onSubmit, loading = false, isEditMode = false }) {
  const navigate = useNavigate();

  // Basic Fields
  const [formData, setFormData] = useState({
    planName: initialData.planName || "",
    billingCycle: initialData.billingCycle || "Monthly",
    tier: initialData.tier || "Basic",
    price: initialData.price || "",
    originalPrice: initialData.originalPrice || "",
    savingsText: initialData.savingsText || "",
    tag: initialData.tag || "",
    status: initialData.status !== undefined ? initialData.status : true,
  });

  // Features Array
  const [features, setFeatures] = useState(
    initialData.features && initialData.features.length > 0
      ? initialData.features
      : [{ title: "", description: "" }]
  );

  // Image Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData.image || null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, { title: "", description: "" }]);
  };

  const removeFeature = (index) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  // Handle Image Selection
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      setImageSrc(imageDataUrl);
      setCropModalOpen(true);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImageBlob(croppedBlob);
      setPreviewUrl(URL.createObjectURL(croppedBlob));
      setCropModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image.");
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setImageSrc(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.planName || !formData.price) {
      toast.error("Plan Name and Price are required.");
      return;
    }

    // Filter empty features
    const validFeatures = features.filter((f) => f.title.trim() !== "");

    const payload = new FormData();
    payload.append("planName", formData.planName);
    payload.append("billingCycle", formData.billingCycle);
    payload.append("tier", formData.tier);
    payload.append("price", formData.price);
    if (formData.originalPrice) payload.append("originalPrice", formData.originalPrice);
    if (formData.savingsText) payload.append("savingsText", formData.savingsText);
    if (formData.tag) payload.append("tag", formData.tag);
    payload.append("status", formData.status);
    payload.append("features", JSON.stringify(validFeatures));

    if (croppedImageBlob) {
      payload.append("image", croppedImageBlob, "plan-image.jpg");
    }

    onSubmit(payload);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          {isEditMode ? "Update Membership Plan" : "Create Membership Plan"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Premium Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle *</label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag (Optional)</label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Most Popular"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-t pt-6">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="For strike-through price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Savings Text</label>
                <input
                  type="text"
                  name="savingsText"
                  value={formData.savingsText}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Save 25%"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Image */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-t pt-6">Plan Image</h3>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center overflow-hidden bg-gray-50 relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                  Choose Image to Crop
                </label>
                <p className="text-xs text-gray-500 mt-2">Required aspect ratio approx 16:9 or 1:1 depending on UI.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-t pt-6">Plan Features</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                      placeholder="Feature Title (e.g. Free Cancellation)"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                      placeholder="Feature Description (Optional)"
                      rows="2"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> Add Feature
              </button>
            </div>
          </div>

          {/* Section 5: Status */}
          <div className="border-t pt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Active Status</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <button
              type="button"
              onClick={() => navigate("/home/membership")}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]"
            >
              {loading ? <LoderBtn /> : isEditMode ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>

      {/* Image Crop Modal */}
      <Modal
        title="Crop Image"
        open={cropModalOpen}
        onCancel={handleCropCancel}
        onOk={handleCropSave}
        okText="Crop & Save"
        width={600}
        destroyOnClose
      >
        <div className="relative w-full h-[400px] bg-gray-900 rounded-lg overflow-hidden mt-4">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3} // Adjustable aspect ratio
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>
        <div className="mt-4 px-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="w-full"
          />
        </div>
      </Modal>
    </div>
  );
}
