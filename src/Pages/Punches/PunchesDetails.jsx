import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getPunchById } from "../../Services/PunchesApi";

const PunchView = () => {
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
            const res = await getPunchById(id);
            if (res?.status) setData(res.data);
        } catch (err) {
            toast.error(err.message || "Failed to fetch punch details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    const show = (val) => val || "N/A";

    return (
        <div className="m-3">
            <Breaker />

            <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl w-full">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        Punch Details
                    </h2>
                </div>

                {data ? (
                    <div className="space-y-6">

                        {/* 🔹 PUNCH DETAILS */}
                        <div className="bg-gray-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-4 text-gray-700">
                                Punch Details
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4">

                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium">{show(data.status)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Total Minutes</p>
                                    <p>{show(data.totalMinutes)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Admin Override</p>
                                    <p>{data.adminOverride ? "Yes" : "No"}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Punch In Time</p>
                                    <p>{show(data.punchInAtIST)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Punch Out Time</p>
                                    <p>{show(data.punchOutAtIST)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Punch In Valid</p>
                                    <p>{data.punchInValid ? "Valid" : "Invalid"}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Punch Out Valid</p>
                                    <p>{data.punchOutValid ? "Valid" : "Invalid"}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">In Distance</p>
                                    <p>{show(data.punchInDistanceFromZone)} m</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Out Distance</p>
                                    <p>{show(data.punchOutDistanceFromZone)} m</p>
                                </div>

                            </div>

                            {/* LOCATION */}
                            <div className="grid md:grid-cols-2 gap-4 mt-5">

                                <div>
                                    <p className="text-sm text-gray-500">Punch In Location</p>
                                    <p>
                                        Lat: {show(data?.punchInLocation?.lat)} <br />
                                        Lng: {show(data?.punchInLocation?.lng)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Punch Out Location</p>
                                    <p>
                                        Lat: {show(data?.punchOutLocation?.lat)} <br />
                                        Lng: {show(data?.punchOutLocation?.lng)}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* 🔹 DRIVER DETAILS */}
                        <div className="bg-blue-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-4 text-blue-700">
                                Driver Details
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4 items-center">

                                <div>
                                    <p className="text-gray-500 text-sm">Name</p>
                                    <p className="font-medium">
                                        {show(data?.driver?.name)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Phone</p>
                                    <p className="font-medium">
                                        {show(data?.driver?.phone)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Profile</p>
                                    {data?.driver?.profilePic ? (
                                        <img
                                            src={data.driver.profilePic}
                                            alt="driver"
                                            className="w-16 h-16 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <p>N/A</p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* 🔹 REGION & PUNCH REGION */}
                        <div className="bg-green-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-4 text-green-700">
                                Region Details
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4">

                                <div>
                                    <p className="text-sm text-gray-500">Region Name</p>
                                    <p className="font-medium">
                                        {show(data?.region?.name)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">State</p>
                                    <p className="font-medium">
                                        {show(data?.region?.state)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Punch Region</p>
                                    <p className="font-medium">
                                        {show(data?.punchRegion?.name)}
                                    </p>
                                </div>

                                <div className="md:col-span-3">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p>{show(data?.punchRegion?.address)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Center Lat</p>
                                    <p>{show(data?.punchRegion?.centerLat)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Center Lng</p>
                                    <p>{show(data?.punchRegion?.centerLng)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Radius</p>
                                    <p>{show(data?.punchRegion?.radiusMeters)} m</p>
                                </div>

                            </div>
                        </div>

                    </div>
                ) : (
                    <p className="text-center text-gray-500">No Data Found</p>
                )}

                {/* BACK BUTTON */}
                <div className="mt-8">
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

export default PunchView;