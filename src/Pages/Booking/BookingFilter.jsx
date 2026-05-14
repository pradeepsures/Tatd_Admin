import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Select } from "antd";

import { getAllSegment } from "../../Services/SegmentApi";
import { getAllRegions } from "../../Services/RegionApi";
import { getAllDrivers } from "../../Services/DriverApi";

const { Option } = Select;

const formatDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
};

export default function BookingFilter({ appliedFilters, onApply, onReset }) {

    // ✅ LOCAL STATE (LIKE COMPLAINT FILTER)
    const [localFilters, setLocalFilters] = useState({ ...appliedFilters });

    // DROPDOWN STATES
    const [segments, setSegments] = useState([]);
    const [regions, setRegions] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [segmentLoading, setSegmentLoading] = useState(false);
    const [regionLoading, setRegionLoading] = useState(false);
    const [driverLoading, setDriverLoading] = useState(false);

    const [regionSearch, setRegionSearch] = useState("");
    const [driverSearch, setDriverSearch] = useState("");

    // ✅ SYNC WITH PARENT (IMPORTANT)
    useEffect(() => {
        setLocalFilters({ ...appliedFilters });
    }, [appliedFilters]);

    // HANDLE CHANGE
    const handleChange = (key, value) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    // FETCH SEGMENTS
    const fetchSegments = async () => {
        setSegmentLoading(true);
        try {
            const res = await getAllSegment({ page: 1, rowsPerPage: 50 });
            if (res?.status) setSegments(res.data || []);
        } finally {
            setSegmentLoading(false);
        }
    };

    // FETCH REGIONS
    const fetchRegions = async (search = "") => {
        setRegionLoading(true);
        try {
            const res = await getAllRegions({
                page: 1,
                rowsPerPage: 50,
                searchQuery: search,
            });
            if (res?.status) setRegions(res.data || []);
        } finally {
            setRegionLoading(false);
        }
    };

    // FETCH DRIVERS
    const fetchDrivers = async (search = "") => {
        setDriverLoading(true);
        try {
            const res = await getAllDrivers({
                page: 1,
                rowsPerPage: 50,
                searchQuery: search,
            });
            if (res?.status) setDrivers(res.data || []);
        } finally {
            setDriverLoading(false);
        }
    };

    // INITIAL LOAD
    useEffect(() => {
        fetchSegments();
        fetchRegions();
        fetchDrivers();
    }, []);

    // SEARCH HANDLERS
    useEffect(() => {
        fetchRegions(regionSearch);
    }, [regionSearch]);

    useEffect(() => {
        fetchDrivers(driverSearch);
    }, [driverSearch]);

    // APPLY
    const handleApply = () => {
    onApply({
        ...localFilters,
        startDate: localFilters.startDateFormatted || "",
        endDate: localFilters.endDateFormatted || "",
    });
};
    // const handleApply = () => {
    //     onApply(localFilters);
    // };

    // RESET
    const handleReset = () => {
        onReset();
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow mb-6">
            <h3 className="text-2xl font-semibold mb-4">Search & Filters</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* SEARCH */}
                <input
                    type="text"
                    placeholder="Search booking /user /chauffeur /vehicle"
                    className="border p-2 rounded-2xl"
                    value={localFilters.searchQuery || ""}
                    onChange={(e) => handleChange("searchQuery", e.target.value)}
                />

                {/* DATE */}

                <input
                    type={localFilters.startDate ? "date" : "text"}
                    placeholder="Start Date"
                    className="border p-2 rounded-2xl"
                    value={localFilters.startDate}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                    }}
                    onChange={(e) => {
                        const raw = e.target.value; // yyyy-mm-dd
                        handleChange("startDate", raw); // keep raw for input
                        handleChange("startDateFormatted", formatDate(raw)); // dd-mm-yyyy for API
                    }}
                />

                <input
                    type={localFilters.endDate ? "date" : "text"}
                    placeholder="End Date"
                    className="border p-2 rounded-2xl"
                    value={localFilters.endDate}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                    }}
                    onChange={(e) => {
                        const raw = e.target.value;
                        handleChange("endDate", raw);
                        handleChange("endDateFormatted", formatDate(raw));
                    }}
                />
                {/* <input
                    type="date"
                    className="border p-2 rounded-2xl"
                    value={localFilters.startDate || ""}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                />

                <input
                    type="date"
                    className="border p-2 rounded-2xl"
                    value={localFilters.endDate || ""}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                /> */}

                {/* BOOKING TYPE */}
                <select
                    className="border p-2 rounded-2xl"
                    value={localFilters.bookingType || ""}
                    onChange={(e) => handleChange("bookingType", e.target.value)}
                >
                    <option value="">Booking Type</option>
                    <option value="one_way">One Way</option>
                    <option value="round_trip">Round Trip</option>
                    <option value="hourly">Hourly</option>
                    <option value="intercity">Intercity</option>
                </select>

                {/* PAYMENT STATUS */}
                <select
                    className="border p-2 rounded-2xl"
                    value={localFilters.paymentStatus || ""}
                    onChange={(e) => handleChange("paymentStatus", e.target.value)}
                >
                    <option value="">Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>

                {/* ASSIGNMENT STATUS */}
                <select
                    className="border p-2 rounded-2xl"
                    value={localFilters.assignmentStatus || ""}
                    onChange={(e) => handleChange("assignmentStatus", e.target.value)}
                >
                    <option value="">Assignment Status</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="reassigning">Reassigning</option>
                </select>

                {/* TRIP STATUS */}
                <select
                    className="border p-2 rounded-2xl"
                    value={localFilters.tripStatus || ""}
                    onChange={(e) => handleChange("tripStatus", e.target.value)}
                >
                    <option value="">Trip Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="driver_enroute">Driver Enroute</option>
                    <option value="arrived">Reached</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {/* OVERALL STATUS */}
                <select
                    className="border p-2 rounded-2xl"
                    value={localFilters.overallStatus || ""}
                    onChange={(e) => handleChange("overallStatus", e.target.value)}
                >
                    <option value="">Overall Status</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="payment_done">Payment Completed</option>
                    <option value="admin_assigning">Admin Assigned</option>
                    <option value="driver_assigned">Driver Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {/* SEGMENT */}
                <Select
                    showSearch
                    placeholder="Segment"
                    value={localFilters.segment || undefined}
                    onChange={(val) => handleChange("segment", val)}
                    className="custom-select w-full "
                    loading={segmentLoading}
                >
                    {segments.map((s) => (
                        <Option key={s._id} value={s._id}>
                            {s.name}
                        </Option>
                    ))}
                </Select>

                {/* REGION */}
                <Select
                    showSearch
                    placeholder="Region"
                    value={localFilters.region || undefined}
                    onChange={(val) => handleChange("region", val)}
                    className="custom-select w-full"
                    loading={regionLoading}
                >
                    {regions.map((r) => (
                        <Option key={r._id} value={r._id}>
                            {r.name} ({r.state})
                        </Option>
                    ))}
                </Select>

                {/* DRIVER */}
                <Select
                    showSearch
                    placeholder="Chauffeur"
                    value={localFilters.driverId || undefined}
                    onChange={(val, option) => {
                        handleChange("driverId", val);
                        handleChange("driverName", option.label);
                    }}
                    className="custom-select w-full "
                    loading={driverLoading}
                >
                    {drivers.map((d) => (
                        <Option
                            key={d._id}
                            value={d._id}
                            label={`${d.name} ${d.phone}`}
                        >
                            {d.name} - {d.phone}
                        </Option>
                    ))}
                </Select>

                {/* VEHICLE */}
                <input
                    type="text"
                    placeholder="Vehicle Number"
                    className="border p-2 rounded-2xl"
                    value={localFilters.carNumber || ""}
                    onChange={(e) => handleChange("carNumber", e.target.value)}
                />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-5">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApply}
                    className="bg-primary text-white px-5 py-2 rounded-2xl"
                >
                    Apply Filters
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="bg-gray-400 text-white px-5 py-2 rounded-2xl"
                >
                    Reset
                </motion.button>
            </div>
        </div>
    );
}