import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const initialFilters = {
  searchQuery: "",
  startDate: "",
  endDate: "",

  overallStatus: "",
  tripStatus: "",
  paymentStatus: "",
  assignmentStatus: "",
  tripType: "",

  driverId: "",
  driverName: "",
  driverPhone: "",
};

const HourlyBookingFilters = ({ filters, setFilters, onApply }) => {
  // ─────────────────────────────────────────────
  // LOCAL TEMP FILTERS
  // ─────────────────────────────────────────────

  const [tempFilters, setTempFilters] = useState(filters);

  // UPDATE TEMP WHEN MAIN FILTERS CHANGE
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  // ─────────────────────────────────────────────
  // HANDLE CHANGE
  // ─────────────────────────────────────────────

  const handleChange = (e) => {
    setTempFilters({
      ...tempFilters,
      [e.target.name]: e.target.value,
    });
  };

  // ─────────────────────────────────────────────
  // APPLY FILTERS
  // ─────────────────────────────────────────────

  const handleApplyFilters = () => {
    setFilters(tempFilters);

    onApply?.(tempFilters);

    toast.success("Filters applied successfully");
  };

  // ─────────────────────────────────────────────
  // CLEAR FILTERS
  // ─────────────────────────────────────────────

  const clearFilters = () => {
    setTempFilters(initialFilters);

    setFilters(initialFilters);

    toast.success("Filters removed successfully");
  };

  // ─────────────────────────────────────────────
  // INPUT STYLE
  // ─────────────────────────────────────────────

  const inputClass = `
    border border-gray-300
    px-3
    py-2
    rounded-xl
    outline-none
    focus:border-black
    focus:ring-0
    text-sm
    w-full
    bg-white
    transition-all
  `;

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm mb-6">
      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SEARCH */}
        <input
          type="text"
          name="searchQuery"
          placeholder="Search Booking....."
          value={tempFilters.searchQuery}
          onChange={handleChange}
          className={inputClass}
        />

        {/* START DATE */}
        <input
          type="date"
          name="startDate"
          value={tempFilters.startDate}
          onChange={handleChange}
          className={inputClass}
        />

        {/* END DATE */}
        <input
          type="date"
          name="endDate"
          value={tempFilters.endDate}
          onChange={handleChange}
          className={inputClass}
        />

        {/* OVERALL STATUS */}
        <select
          name="overallStatus"
          value={tempFilters.overallStatus}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Overall Status</option>

          <option value="pending_payment">Pending Payment</option>

          <option value="completed">Completed</option>
        </select>

        {/* TRIP STATUS */}
        <select
          name="tripStatus"
          value={tempFilters.tripStatus}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Trip Status</option>

          <option value="not_started">Not Started</option>

          <option value="completed">Completed</option>
        </select>

        {/* PAYMENT STATUS */}
        <select
          name="paymentStatus"
          value={tempFilters.paymentStatus}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Payment Status</option>

          <option value="pending">Pending</option>

          <option value="paid">Paid</option>
        </select>

        {/* ASSIGNMENT STATUS */}
        <select
          name="assignmentStatus"
          value={tempFilters.assignmentStatus}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Assignment Status</option>

          <option value="assigned">Assigned</option>

          <option value="unassigned">Unassigned</option>
        </select>

        {/* TRIP TYPE */}
        <select
          name="tripType"
          value={tempFilters.tripType}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Trip Type</option>

          <option value="one_way">One Way</option>

          <option value="round_trip">Round Trip</option>
        </select>

        {/* DRIVER NAME */}
        <input
          type="text"
          name="driverName"
          placeholder="Driver Name"
          value={tempFilters.driverName}
          onChange={handleChange}
          className={inputClass}
        />

        {/* DRIVER PHONE */}
        <input
          type="text"
          name="driverPhone"
          placeholder="Driver Phone"
          value={tempFilters.driverPhone}
          onChange={handleChange}
          className={inputClass}
        />

   <div className="flex flex-wrap gap-3">
        <button
          onClick={handleApplyFilters}
          className="
    bg-gradient-to-r
    from-[#1E3A8A]
    to-[#3B82F6]
    hover:from-[#172d6b]
    hover:to-[#2563eb]
    text-white
    px-5
    py-2
    rounded-xl
    text-sm
    font-medium
    transition-all
    duration-300
    shadow-sm
  "
        >
          Apply Filters
        </button>

        <button
          onClick={clearFilters}
          className="
            bg-gray-600
            hover:bg-gray-900
            text-white
            px-5
            py-2
            rounded-xl
            text-sm
            font-medium
            transition-all
          "
        >
          Clear Filters
        </button>
      </div>

      </div>

      {/* BUTTONS */}
      {/* <div className="flex flex-wrap gap-3 mt-5">
        <button
          onClick={handleApplyFilters}
          className="
    bg-gradient-to-r
    from-[#1E3A8A]
    to-[#3B82F6]
    hover:from-[#172d6b]
    hover:to-[#2563eb]
    text-white
    px-5
    py-2
    rounded-xl
    text-sm
    font-medium
    transition-all
    duration-300
    shadow-sm
  "
        >
          Apply Filters
        </button>

        <button
          onClick={clearFilters}
          className="
            bg-gray-600
            hover:bg-gray-900
            text-white
            px-5
            py-2
            rounded-xl
            text-sm
            font-medium
            transition-all
          "
        >
          Clear Filters
        </button>
      </div> */}
    </div>
  );
};

export default HourlyBookingFilters;
