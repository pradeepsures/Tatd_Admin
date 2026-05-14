import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getPunchRegionById } from "../../Services/PunchRegionApi";

const PunchRegionView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await getPunchRegionById(id);
            if (res?.status) setData(res.data);
        } catch (err) {
            toast.error(err.message || "Failed to fetch details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="m-3">
            <Breaker />

            <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl w-full">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        Punch Region Details
                    </h2>
                </div>

                {data ? (
                    <div className="space-y-6">

                        {/* BASIC INFO */}
                        <div className="grid md:grid-cols-2 gap-6">

                            <div className="bg-gray-50 p-4 rounded-xl border">
                                <p className="text-sm text-gray-500 mb-1">Name</p>
                                <p className="text-lg font-semibold">{data.name}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border">
                                <p className="text-sm text-gray-500 mb-3">Region</p>

                                <div className="flex justify-between items-center">

                                    {/* LEFT - NAME */}
                                    <div>
                                        <p className="text-xs text-gray-400">Name</p>
                                        <p className="text-lg font-semibold">
                                            {data?.region?.name || "N/A"}
                                        </p>
                                    </div>

                                    {/* RIGHT - STATE */}
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">State</p>
                                        <p className="text-md font-medium text-gray-700">
                                            {data?.region?.state || "N/A"}
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>

                        {/* LOCATION */}
                        <div className="bg-blue-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-3 text-blue-700">
                                Location Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <p className="text-gray-500 text-sm">Latitude</p>
                                    <p className="font-medium">{data.centerLat}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Longitude</p>
                                    <p className="font-medium">{data.centerLng}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Radius</p>
                                    <p className="font-medium">{data.radiusMeters} meters</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${data.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {data.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                            </div>

                            <div className="mt-4">
                                <p className="text-gray-500 text-sm">Address</p>
                                <p className="font-medium">{data.address}</p>
                            </div>
                        </div>

                        {/* CREATED BY */}
                        <div className="bg-green-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-3 text-green-700">
                                Created By
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <p className="text-gray-500 text-sm">Email</p>
                                    <p className="font-medium">
                                        {data?.createdBy?.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Created At (IST)</p>
                                    <p className="font-medium">
                                        {data?.createdBy?.createdAtIST}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* DATES */}
                        <div className="grid md:grid-cols-2 gap-6">

                            <div className="bg-gray-50 p-4 rounded-xl border">
                                <p className="text-sm text-gray-500">Created At</p>
                                <p className="font-medium">
                                    {new Date(data.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border">
                                <p className="text-sm text-gray-500">Updated At</p>
                                <p className="font-medium">
                                    {new Date(data.updatedAt).toLocaleString()}
                                </p>
                            </div>

                        </div>

                    </div>
                ) : (
                    <p className="text-center text-gray-500">No Data Found</p>
                )}

                {/* BUTTON */}
                <div className="mt-8 flex gap-4">

                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-600 text-white px-6 py-3 rounded-xl"
                    >
                        Back
                    </button>

                </div>

            </div>
        </div>
    );
};

export default PunchRegionView;