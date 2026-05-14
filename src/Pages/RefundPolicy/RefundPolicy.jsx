import React, { useState, useEffect } from "react";
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
  const [activeType, setActiveType] = useState("user");

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
    <div className="min-h-screen bg-gray-100 p-5">
      <Breaker />

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Refund Policy</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleTypeChange("user")}
            className={`px-4 py-2 rounded ${
              activeType === "user"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
          >
            User
          </button>

          <button
            onClick={() => handleTypeChange("driver")}
            className={`px-4 py-2 rounded ${
              activeType === "driver"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
          >
            Driver
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center">
            <Loader />
          </div>
        ) : (
          <>
            <RichTextEditor
              value={values[activeType]}
              onChange={handleInputChange}
              className="min-h-[300px] border rounded"
            />

            <button
              onClick={handleUpdate}
              className="mt-4 px-6 py-2 bg-primary text-white rounded"
            >
              Update Refund Policy
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RefundPolicy;