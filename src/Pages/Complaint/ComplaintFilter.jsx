import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Select } from "antd";
const { Option } = Select;

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
};

export default function ComplaintFilter({ appliedFilters, onApply, onReset }) {
  // Local state for editing before applying
  const [localFilters, setLocalFilters] = useState({ ...appliedFilters });

  const issueCategories = ["booking", "driver", "payment", "other"];
  const ticketStatuses = ["open", "in_progress", "resolved", "closed"];
  const onModels = ["User", "Driver"];

  // Sync local state when appliedFilters change (e.g., after reset)
  useEffect(() => {
    setLocalFilters({ ...appliedFilters });
  }, [appliedFilters]);

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // const handleApply = () => {
  //   onApply(localFilters); // Only push changes on Apply
  // };

  const handleApply = () => {
    onApply({
      ...localFilters,
      startDate: localFilters.startDateFormatted || "",
      endDate: localFilters.endDateFormatted || "",
    });
  };

  const handleReset = () => {
    onReset(); // Parent will reset applied filters
  };

  return (
    <div className="card card-pad">
      <div className="mb-4">
        <p className="section-label">Refine results</p>
        <h3 className="card-title mt-1">Search & Filters</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by Ticket ID / Reporter Name / Email / Phone / Description"
          className="field !h-10"
          value={localFilters.searchQuery}
          onChange={(e) => handleChange("searchQuery", e.target.value)}
        />


        {/* START DATE */}
        <input
          type={localFilters.startDate ? "date" : "text"}
          placeholder="Start Date"
          className="field !h-10"
          value={localFilters.startDate || ""}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = "text";
          }}
          onChange={(e) => {
            const raw = e.target.value; // yyyy-mm-dd
            handleChange("startDate", raw); // UI
            handleChange("startDateFormatted", formatDate(raw)); // API
          }}
        />

        {/* END DATE */}
        <input
          type={localFilters.endDate ? "date" : "text"}
          placeholder="End Date"
          className="field !h-10"
          value={localFilters.endDate || ""}
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
          className="border p-2 rounded-lg"
          value={localFilters.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded-lg"
          value={localFilters.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
        /> */}

        {/* ISSUE CATEGORY */}
        <Select
          showSearch
          size="large"
          bordered={false}
          placeholder="Issue Category"
          value={localFilters.issueCategory || undefined}
          onChange={(val) => handleChange("issueCategory", val)}
          className="custom-select w-full"
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {issueCategories.map((c) => (
            <Option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Option>
          ))}
        </Select>

        {/* TICKET STATUS */}
        <Select
          showSearch
          size="large"
          bordered={false}
          placeholder="Ticket Status"
          value={localFilters.ticketStatus || undefined}
          onChange={(val) => handleChange("ticketStatus", val)}
          className="custom-select w-full"
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {ticketStatuses.map((status) => (
            <Option key={status} value={status}>
              {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Option>
          ))}
        </Select>

        {/* ON MODEL */}
        <Select
          showSearch
          size="large"
          bordered={false}
          placeholder="On Model"
          value={localFilters.onModel || undefined}
          onChange={(val) => handleChange("onModel", val)}
          className="custom-select w-full"
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {onModels.map((model) => (
            <Option key={model} value={model}>
              {model}
            </Option>
          ))}
        </Select>
      </div>

      {/* BUTTONS */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleApply}
          className="btn-primary w-full sm:w-auto"
        >
          Apply Filters
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="btn-secondary w-full sm:w-auto"
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
}