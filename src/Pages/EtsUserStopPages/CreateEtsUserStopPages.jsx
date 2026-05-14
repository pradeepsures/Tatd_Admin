import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Select } from "antd";


import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import { createEtsUserStopPagesApi } from "../../Services/EtsUserStopPages";
import { getAllEtsUsers } from "../../Services/EtsUserApi";
import { getAllEtsRoutes } from "../../Services/EtsRouteApi";

const { Option } = Select;

const CreateEtsUserStoppage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [stoppages, setStoppages] = useState([]); 

    const [formData, setFormData] = useState({
        user: "",
        route: "",
        boardingStoppage: {
            stoppageId: "",
            name: "",
            lat: "",
            lng: "",
            address: "",
            order: "",
        },
        droppingStoppage: {
            stoppageId: "",
            name: "",
            lat: "",
            lng: "",
            address: "",
            order: "",
        },
        isActive: true,
    });

    // ✅ FETCH USERS + ROUTES
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await getAllEtsUsers({ rowsPerPage: 100 });
                const routeRes = await getAllEtsRoutes({ rowsPerPage: 100 });

                if (userRes?.status) setUsers(userRes.data);
                if (routeRes?.status) setRoutes(routeRes.data);

            } catch {
                toast.error("Failed to load data");
            }
        };

        fetchData();
    }, []);

    // ✅ ROUTE SELECT HANDLER
    const handleRouteChange = (routeId) => {
        const selectedRoute = routes.find((r) => r._id === routeId);

        setFormData({
            ...formData,
            route: routeId,
            boardingStoppage: {},
            droppingStoppage: {},
        });

        // ✅ SET STOPPAGES FROM ROUTE
        if (selectedRoute?.stoppages) {
            setStoppages(selectedRoute.stoppages);
        } else {
            setStoppages([]);
        }
    };

    // ✅ AUTO FILL STOPPAGE
    const handleStoppageSelect = (type, stoppageId) => {
        const stop = stoppages.find((s) => s._id === stoppageId);

        if (!stop) return;

        const data = {
            stoppageId: stop._id,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            address: stop.address,
            order: stop.order,
        };

        setFormData((prev) => ({
            ...prev,
            [type]: data,
        }));
    };

    // ✅ SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.user || !formData.route) {
            return toast.error("User & Route required");
        }

        try {
            setLoading(true);

            const res = await createEtsUserStopPagesApi(formData);

            if (res?.status) {
                toast.success("Created successfully");
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Breaker />

            <div className="mt-6 bg-white p-6 w-full rounded-xl shadow-xl">
                <form onSubmit={handleSubmit}>

                    {/* USER */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium ml-1">
                            Select User *
                        </label>
                        <Select
                            size="large"
                            placeholder="Select User"
                            className="w-full mt-1 custom-select"
                            onChange={(val) => setFormData({ ...formData, user: val })}
                            showSearch
                        >
                            {users.map((u) => (
                                <Option key={u._id} value={u._id}>
                                    {u.name || u.email}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* ROUTE */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium ml-1">
                            Select Route *
                        </label>
                        <Select
                            size="large"
                            placeholder="Select Route"
                            className="w-full mt-1 custom-select"
                            onChange={handleRouteChange}
                            showSearch
                        >
                            {routes.map((r) => (
                                <Option key={r._id} value={r._id}>
                                    {r.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* BOARDING */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <div className="mt-4">
                            <label className="block text-sm font-medium ml-1">
                                Select Boarding Stoppage *
                            </label>

                            <Select
                                size="large"
                                placeholder="Select Boarding Stoppage"
                                className="w-full mt-1 custom-select"
                                onChange={(val) =>
                                    handleStoppageSelect("boardingStoppage", val)
                                }
                                showSearch
                            >
                                {stoppages.map((s) => (
                                    <Option key={s._id} value={s._id}>
                                        {s.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* AUTO FILLED */}
                        {/* NAME */}
                        <label className="block mt-3 text-sm font-medium ml-1">
                            Name
                        </label>
                        <input
                            value={formData.boardingStoppage?.name || ""}
                            readOnly
                            className="border p-2 mt-1 w-full rounded-xl"
                        />

                        {/* LAT */}
                        <label className="block mt-3 text-sm font-medium ml-1">
                            Latitude
                        </label>
                        <input
                            value={formData.boardingStoppage?.lat || ""}
                            readOnly
                            className="border p-2 mt-1 w-full rounded-xl"
                        />

                        {/* LNG */}
                        <label className="block mt-3 text-sm font-medium ml-1">
                            Longitude
                        </label>
                        <input
                            value={formData.boardingStoppage?.lng || ""}
                            readOnly
                            className="border p-2 mt-1 w-full rounded-xl"
                        />

                        {/* ADDRESS */}
                        <label className="block mt-3 text-sm font-medium ml-1">
                            Address
                        </label>
                        <input
                            value={formData.boardingStoppage?.address || ""}
                            readOnly
                            className="border p-2 mt-1 w-full rounded-xl"
                        />
                    </div>

                    {/* DROPPING */}
                    <div className="mt-6 p-4 bg-green-50 rounded-xl">
                        {/* DROPPING SELECT */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium ml-1">
                                Select Dropping Stoppage *
                            </label>

                            <Select
                                size="large"
                                placeholder="Select Dropping Stoppage"
                                className="w-full mt-1 custom-select"
                                onChange={(val) =>
                                    handleStoppageSelect("droppingStoppage", val)
                                }
                                showSearch
                            >
                                {stoppages.map((s) => (
                                    <Option key={s._id} value={s._id}>
                                        {s.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* AUTO FILLED */}
                        <label className="block mt-3 text-sm font-medium ml-1">
                            Name
                        </label>
                        <input value={formData.droppingStoppage?.name || ""} readOnly className="border p-2 mt-1 w-full rounded-xl" />

                        <label className="block mt-3 text-sm font-medium ml-1">
                            Latitude
                        </label>
                        <input value={formData.droppingStoppage?.lat || ""} readOnly className="border p-2 mt-1 w-full rounded-xl" />

                        <label className="block mt-3 text-sm font-medium ml-1">
                            Longitude
                        </label>
                        <input value={formData.droppingStoppage?.lng || ""} readOnly className="border p-2 mt-1 w-full rounded-xl" />

                        <label className="block mt-3 text-sm font-medium ml-1">
                            Address
                        </label>
                        <input value={formData.droppingStoppage?.address || ""} readOnly className="border p-2 mt-1 w-full rounded-xl" />
                    </div>

                    {/* ACTIVE TOGGLE */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium ml-1 mb-2">
                            Status
                        </label>

                        <div
                            onClick={() =>
                                setFormData({ ...formData, isActive: !formData.isActive })
                            }
                            className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${formData.isActive ? "bg-green-500" : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${formData.isActive ? "translate-x-7" : ""
                                    }`}
                            />
                        </div>

                        {/* TEXT */}
                        <span
                            className={`ml-2 text-sm font-medium ${formData.isActive ? "text-green-600" : "text-gray-500"
                                }`}
                        >
                            {formData.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button className=" bg-primary text-white py-3 px-6 rounded-2xl">
                            Create
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className=" bg-gray-500 text-white py-3 px-6 rounded-2xl"
                        >
                            Back
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateEtsUserStoppage;