import React, { useState, useEffect } from "react";
import useAdminListState from "../../hooks/useAdminListState";
import toast from "react-hot-toast";
import RichTextEditor from "react-rte";
import "react-rte/lib/RichTextEditor.css";

import {
  getAllRefundPolicy,
  updateRefundPolicyApi,
} from "../../Services/RefundPolicy";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

const RefundPolicy = () => {
  const [activeType, setActiveType] = useAdminListState("activeType", "user");

  const [values, setValues] = useState({
    user: RichTextEditor.createEmptyValue(),
    driver: RichTextEditor.createEmptyValue(),
  });

  const [ids, setIds] = useState({
    user: "",
    driver: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllRefundPolicy({
        page: 1,
        rowsPerPage: 10,
        searchQuery: "",
      });

      const list = result.data || [];

      const mappedValues = {
        user: RichTextEditor.createEmptyValue(),
        driver: RichTextEditor.createEmptyValue(),
      };

      const mappedIds = {
        user: "",
        driver: "",
      };

      list.forEach((item) => {
        const type = item.type;

        mappedValues[type] = RichTextEditor.createValueFromString(
          item.refundPolicy || "",
          "html"
        );

        mappedIds[type] = item._id;
      });

      setValues(mappedValues);
      setIds(mappedIds);
    } catch (err) {
      toast.error(err.message || "Failed to fetch Refund Policy!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Tab Change
  const handleTypeChange = (type) => {
    setActiveType(type);
  };

  // ✅ Editor Change
  const handleInputChange = (value) => {
    setValues((prev) => ({
      ...prev,
      [activeType]: value,
    }));
  };

  // ✅ Update
  const handleUpdate = async () => {
    const currentId = ids[activeType];
    const htmlContent = values[activeType].toString("html");

    if (!currentId || htmlContent.trim() === "<p><br></p>") {
      toast.error("Invalid content!");
      return;
    }

    try {
      const result = await updateRefundPolicyApi({
        id: currentId,
        data: {
          refundPolicy: htmlContent,
          type: activeType,
        },
      });

      if (result.status) {
        toast.success("Refund Policy updated!");
      } else {
        toast.error(result.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err.message || "Update failed!");
    }
  };

  return (
    <div className="page-shell">
      <Breaker />

      <div className="card card-pad">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Content</p>
          <h1 className="page-title">Refund Policy</h1>
        </div>

        {/* Tabs */}
        <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto">
          <button
            onClick={() => handleTypeChange("user")}
            className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeType === "user"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            User
          </button>

          <button
            onClick={() => handleTypeChange("driver")}
            className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeType === "driver"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Driver
          </button>
        </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader />
          </div>
        ) : (
          <>
            <RichTextEditor
              value={values[activeType]}
              onChange={handleInputChange}
              className="min-h-[300px] border rounded"
            />

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              onClick={handleUpdate}
              className="btn-primary w-full sm:w-auto"
            >
              Update Refund Policy
            </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RefundPolicy;