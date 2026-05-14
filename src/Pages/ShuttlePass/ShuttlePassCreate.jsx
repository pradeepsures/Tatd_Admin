import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { createShuttlePassApi } from "../../Services/ShuttlePassApi";

const CreateShuttlePass = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        shortDescription: "",
        description: "",
        benefits: "",
        rideCount: "",
        validityDays: "",
        isActive: true,
        thumbImage: null,
    });

    const [errors, setErrors] = useState({});

    // ✅ INPUT CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ✅ IMAGE CHANGE
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData({ ...formData, thumbImage: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // CLEANUP
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    // ✅ SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name required";
        if (!formData.rideCount) newErrors.rideCount = "Ride count required";

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);

            const fd = new FormData();

            fd.append("name", formData.name);
            fd.append("shortDescription", formData.shortDescription);
            fd.append("description", formData.description);

            // ✅ BENEFITS → convert textarea to array
            const benefitsArray = formData.benefits
                .split("\n")
                .map((b) => b.trim())
                .filter((b) => b);

            fd.append("benefits", JSON.stringify(benefitsArray));

            fd.append("rideCount", formData.rideCount);
            fd.append("validityDays", formData.validityDays || 1);
            fd.append("isActive", formData.isActive);

            if (formData.thumbImage) {
                fd.append("thumbImage", formData.thumbImage);
            }

            const res = await createShuttlePassApi(fd);

            if (res?.status) {
                toast.success("Shuttle Pass created successfully");
                navigate(-1);
            }
        } catch (err) {
            toast.error(err.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="m-3">
            <Breaker />

            <div className="mt-6 bg-white p-6 rounded-xl shadow-xl w-full">
                <form onSubmit={handleSubmit}>

                    {/* NAME */}
                    <label className="block mt-2">Name *</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {errors.name && <p className="text-red-500">{errors.name}</p>}

                    {/* SHORT DESC */}
                    <label className="block mt-4">Short Description</label>
                    <input
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />

                    {/* DESCRIPTION */}
                    <label className="block mt-4">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border rounded-xl p-3"
                        rows={3}
                    />

                    {/* BENEFITS */}
                    <label className="block mt-4">
                        Benefits (one per line)
                    </label>
                    <textarea
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleChange}
                        className="w-full border rounded-xl p-3"
                        rows={4}
                    />

                    {/* RIDE COUNT */}
                    <label className="block mt-4">Ride Count *</label>
                    <input
                        type="number"
                        name="rideCount"
                        value={formData.rideCount}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {errors.rideCount && (
                        <p className="text-red-500">{errors.rideCount}</p>
                    )}

                    {/* VALIDITY */}
                    <label className="block mt-4">Validity Days</label>
                    <input
                        type="number"
                        name="validityDays"
                        value={formData.validityDays}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />

                    {/* STATUS */}
                    <label className="block mt-4">Status</label>
                    <select
                        value={formData.isActive}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                isActive: e.target.value === "true",
                            })
                        }
                        className="w-full h-10 border rounded-xl"
                    >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                    </select>

                    {/* IMAGE */}
                    <label className="ml-2 mt-5 font-normal block">Thumbnail Image:</label>

                    {/* PREVIEW */}
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-36 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}

                    {/* THUMBNAIL */}
                    <label
                        htmlFor="thumb-upload"
                        className="flex items-center justify-center w-full h-12 border border-gray-400 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-all px-4"
                    >
                        🖼️ Upload Thumbnail
                    </label>

                    <input
                        id="thumb-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    {/* <label className="block mt-4">Thumbnail</label>

          {imagePreview && (
            <img
              src={imagePreview}
              className="h-24 w-32 object-cover rounded mb-2"
            />
          )}

          <input type="file" onChange={handleImageChange} /> */}

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="submit"
                            className="bg-primary text-white py-3 px-6 rounded-2xl"
                        >
                            Create Pass
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

export default CreateShuttlePass;