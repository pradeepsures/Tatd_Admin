import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getFuelLogById } from "../../Services/FuelLogsApi";

const FuelLogView = () => {
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
            const res = await getFuelLogById(id);
            if (res?.status) setData(res.data);
        } catch (err) {
            toast.error(err.message || "Failed to fetch details");
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
                        Fuel Log Details
                    </h2>
                </div>

                {data ? (
                    <div className="space-y-6">

                        {/* 🔹 FUEL LOG CARD */}
                        <div className="bg-gray-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-4 text-gray-700">
                                Fuel Log Details
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4">

                                <div>
                                    <p className="text-sm text-gray-500">Vehicle Number</p>
                                    <p>{show(data.carNumber)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Fuel Type</p>
                                    <p>{show(data.fuelType)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Fuel Quantity</p>
                                    <p>{show(data.fuelQuantity)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Fuel Price</p>
                                    <p>₹ {show(data.fuelPrice)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p>₹ {show(data.fuelAmount)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Odometer</p>
                                    <p>{show(data.odometerReading)}</p>
                                </div>

                                <div className="md:col-span-3">
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p>{show(data.locationAddress)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Latitude</p>
                                    <p>{show(data.locationLat)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Longitude</p>
                                    <p>{show(data.locationLng)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p>
                                        {data.date
                                            ? new Date(data.date).toLocaleString()
                                            : "N/A"}
                                    </p>
                                </div>

                            </div>

                            {/* IMAGES */}
                            <div className="grid md:grid-cols-4 gap-4 mt-5">

                                {[
                                    { label: "Odometer", src: data.odometerMeterImage },
                                    { label: "Start Meter", src: data.startFuelMeterImage },
                                    { label: "End Meter", src: data.endFuelMeterImage },
                                    { label: "Bill", src: data.billImage },
                                ].map((img, i) => (
                                    <div key={i}>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {img.label}
                                        </p>
                                        {img.src ? (
                                            <img
                                                src={img.src}
                                                alt="img"
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                        ) : (
                                            <p>N/A</p>
                                        )}
                                    </div>
                                ))}

                            </div>
                        </div>

                        {/* 🔹 DRIVER CARD */}
                        <div className="bg-blue-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-4 text-blue-700">
                                Chauffeur Details
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

                        {/* 🔹 VEHICLE CARD */}
                        <div className="bg-green-50 p-5 rounded-xl border">
                            <h3 className="font-semibold mb-4 text-green-700">
                                Vehicle Details
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4">

                                <div>
                                    <p className="text-gray-500 text-sm">Brand</p>
                                    <p className="font-medium">
                                        {show(data?.vehicle?.brand)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Model</p>
                                    <p className="font-medium">
                                        {show(data?.vehicle?.model)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Car Number</p>
                                    <p className="font-medium">
                                        {show(data?.vehicle?.carNumber)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Fuel Type</p>
                                    <p className="font-medium">
                                        {show(data?.vehicle?.fuelType)}
                                    </p>
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

export default FuelLogView;