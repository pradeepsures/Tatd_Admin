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

  // Dynamic Benefits
  const [benefits, setBenefits] = useState({
    discountType: initialData.benefits?.discountType || "none",
    discountValue: initialData.benefits?.discountValue || 0,
    zeroCancellationFee: initialData.benefits?.zeroCancellationFee || false,
    freeRidesPerMonth: initialData.benefits?.freeRidesPerMonth || 0,
    priorityDriverAssignment: initialData.benefits?.priorityDriverAssignment || false,
  });

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

  const handleBenefitChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBenefits((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    payload.append("benefits", JSON.stringify(benefits));

    if (croppedImageBlob) {
      payload.append("image", croppedImageBlob, "plan-image.jpg");
    }

    onSubmit(payload);
  };

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card mx-auto w-full max-w-5xl p-5 sm:p-8">
        <div className="mb-7 flex items-center gap-3 border-b border-slate-200/70 pb-5">
          <div>
            <p className="section-label">{isEditMode ? "Update record" : "New record"}</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {isEditMode ? "Update Membership Plan" : "Create Membership Plan"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="card-title mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Plan Name *</label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleChange}
                  required
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="e.g. Premium Plan"
                />
              </div>

              <div>
                <label className="field-label">Billing Cycle *</label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  className="field"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="field-label">Tier *</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="field"
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="field-label">Tag (Optional)</label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="e.g. Most Popular"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div>
            <h3 className="card-title mb-4 border-t border-slate-200/70 pt-6">Pricing</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="field-label">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="field-label">Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="For strike-through price"
                />
              </div>

              <div>
                <label className="field-label">Savings Text</label>
                <input
                  type="text"
                  name="savingsText"
                  value={formData.savingsText}
                  onChange={handleChange}
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="e.g. Save 25%"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Image */}
          <div>
            <h3 className="card-title mb-4 border-t border-slate-200/70 pt-6">Plan Image</h3>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-32 w-32 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white/60 ring-1 ring-black/5">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <PhotoIcon className="h-8 w-8 text-slate-400" />
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
                  className="btn-secondary cursor-pointer"
                >
                  Choose Image to Crop
                </label>
                <p className="mt-2 text-xs text-slate-500">Required aspect ratio approx 16:9 or 1:1 depending on UI.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Benefits */}
          <div>
            <h3 className="card-title mb-4 border-t border-slate-200/70 pt-6">Dynamic Benefits</h3>
            <p className="-mt-2 mb-4 text-sm text-slate-500">These values will be automatically applied by the system.</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="field-label">Discount Type</label>
                <select
                  name="discountType"
                  value={benefits.discountType}
                  onChange={handleBenefitChange}
                  className="field"
                >
                  <option value="none">None</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              
              <div>
                <label className="field-label">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  value={benefits.discountValue}
                  onChange={handleBenefitChange}
                  min="0"
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="e.g. 5 or 50"
                  disabled={benefits.discountType === "none"}
                />
              </div>

              <div>
                <label className="field-label">Free Rides Per Month</label>
                <input
                  type="number"
                  name="freeRidesPerMonth"
                  value={benefits.freeRidesPerMonth}
                  onChange={handleBenefitChange}
                  min="0"
                  className="field disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="e.g. 2"
                />
              </div>

              <div className="flex items-end">
                <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-3.5">
                  <input
                    type="checkbox"
                    name="zeroCancellationFee"
                    checked={benefits.zeroCancellationFee}
                    onChange={handleBenefitChange}
                    className="h-5 w-5 rounded border-slate-300 accent-[#111827]"
                  />
                  <span className="text-sm font-semibold text-slate-700">Zero Cancellation Fee</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-3.5">
                  <input
                    type="checkbox"
                    name="priorityDriverAssignment"
                    checked={benefits.priorityDriverAssignment}
                    onChange={handleBenefitChange}
                    className="h-5 w-5 rounded border-slate-300 accent-[#111827]"
                  />
                  <span className="text-sm font-semibold text-slate-700">Priority Driver Assignment</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Features */}
          <div>
            <h3 className="card-title mb-4 border-t border-slate-200/70 pt-6">Visual Features (Text)</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                      placeholder="Feature Title (e.g. Free Cancellation)"
                      className="field disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                      placeholder="Feature Description (Optional)"
                      rows="2"
                      className="field disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="btn-icon text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="btn-ghost -ml-2"
              >
                <PlusIcon className="h-4 w-4" /> Add Feature
              </button>
            </div>
          </div>

          {/* Section 5: Status */}
          <div className="border-t border-slate-200/70 pt-6">
            <label className="inline-flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-3.5">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 accent-[#111827]"
              />
              <span className="text-sm font-semibold text-slate-700">Active Status</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/home/membership")}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[130px] px-6"
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
        <div className="relative mt-4 h-[300px] w-full overflow-hidden rounded-xl bg-slate-900 sm:h-[400px]">
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
        <div className="mt-4 px-1">
          <label className="field-label">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="w-full accent-gray-900"
          />
        </div>
      </Modal>
    </div>
  );
}
