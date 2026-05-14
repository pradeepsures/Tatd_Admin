import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { createAirportRegion } from "../../Services/AirportRegionApi";

const CreateAirportRegion = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        centerLat: "",
        centerLng: "",
        radiusMeters: "",
        isActive: "true",
    });

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState({});

    // HANDLE CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // CLEAR FORM
    const handleClear = () => {
        setFormData({
            name: "",
            address: "",
            centerLat: "",
            centerLng: "",
            radiusMeters: "",
            isActive: "true",
        });
        setApiError({});
    };

    // SUBMIT
    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        setApiError({});

        const errors = {};

        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.address.trim()) errors.address = "Address is required";
        if (!formData.centerLat) errors.centerLat = "Latitude required";
        if (!formData.centerLng) errors.centerLng = "Longitude required";
        if (!formData.radiusMeters) errors.radiusMeters = "Radius required";

        if (Object.keys(errors).length > 0) {
            setApiError(errors);
            setLoading(false);
            return;
        }

        try {

            const payload = {
                ...formData,
                centerLat: Number(formData.centerLat),
                centerLng: Number(formData.centerLng),
                radiusMeters: Number(formData.radiusMeters),
                isActive: formData.isActive === "true",
            };

            const res = await createAirportRegion(payload);

            if (res?.status) {
                toast.success("Airport Region Created");
                navigate(-1);
            } else {
                toast.error(res?.message || "Failed");
            }

        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }

    };

    if (loading) return <Loader />;

    return (
        <div className="m-3">

            <Breaker />

            <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">

                <form onSubmit={handleSubmit}>

                    {/* NAME */}
                    <label className="block mt-4">Region Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter region name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {apiError.name && <p className="text-red-500 text-sm">{apiError.name}</p>}

                    {/* ADDRESS */}
                    <label className="block mt-4">Address</label>
                    <input
                        type="text"
                        name="address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {apiError.address && <p className="text-red-500 text-sm">{apiError.address}</p>}

                    {/* LATITUDE */}
                    <label className="block mt-4">Latitude</label>
                    <input
                        type="number"
                        name="centerLat"
                        placeholder="Enter latitude"
                        value={formData.centerLat}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {apiError.centerLat && <p className="text-red-500 text-sm">{apiError.centerLat}</p>}

                    {/* LONGITUDE */}
                    <label className="block mt-4">Longitude</label>
                    <input
                        type="number"
                        name="centerLng"
                        placeholder="Enter longitude"
                        value={formData.centerLng}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {apiError.centerLng && <p className="text-red-500 text-sm">{apiError.centerLng}</p>}

                    {/* RADIUS */}
                    <label className="block mt-4">Radius (meters)</label>
                    <input
                        type="number"
                        name="radiusMeters"
                        placeholder="Enter radius"
                        value={formData.radiusMeters}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    />
                    {apiError.radiusMeters && (
                        <p className="text-red-500 text-sm">{apiError.radiusMeters}</p>
                    )}

                    {/* STATUS */}
                    <label className="block mt-4">Status</label>
                    <select
                        name="isActive"
                        value={formData.isActive}
                        onChange={handleChange}
                        className="w-full h-10 border rounded-xl px-3"
                    >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 mt-8">

                        {/* BACK */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Back
                        </button>

                        {/* CLEAR */}
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-5 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        >
                            Clear
                        </button>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
                        >
                            Create Region
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default CreateAirportRegion;