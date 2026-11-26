import React, { useState, useEffect } from "react";
import useAdminListState from "../../hooks/useAdminListState";
import toast from "react-hot-toast";
import RichTextEditor from "react-rte";
import "react-rte/lib/RichTextEditor.css";
import {
  updatePrivacyApi,
  getAllPrivacyPolicy,
} from "../../Services/PrivacyPolicyApi";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
const PrivacyPolicy = () => {
  const [activeType, setActiveType] = useAdminListState("activeType", "user");
  const [policies, setPolicies] = useState({
    user: RichTextEditor.createEmptyValue(),
    driver: RichTextEditor.createEmptyValue(),
  });

  const [policyIds, setPolicyIds] = useState({
    user: "",
    driver: "",
  });

  const [loading, setLoading] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const result = await getAllPrivacyPolicy({
        page: 1,
        rowsPerPage: 10,
        searchQuery: "",
      });

      const data = result.data || [];

      const userData = data.find(item => item.type === "user");
      const driverData = data.find(item => item.type === "driver");

      setPolicies({
        user: RichTextEditor.createValueFromString(
          userData?.privacyPolicy || "",
          "html"
        ),
        driver: RichTextEditor.createValueFromString(
          driverData?.privacyPolicy || "",
          "html"
        ),
      });

      setPolicyIds({
        user: userData?._id || "",
        driver: driverData?._id || "",
      });

    } catch (err) {
      toast.error(err.message || "Failed to fetch policies!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [activeType]);

  const handleTypeChange = (type) => setActiveType(type);

  const handleInputChange = (value) => {
    setPolicies((prev) => ({
      ...prev,
      [activeType]: value,
    }));
  };

  const handleUpdate = async () => {
    const currentId = policyIds[activeType];
    const htmlContent = policies[activeType].toString("html");

    if (!currentId || htmlContent.trim() === "<p><br></p>") {
      toast.error("Invalid content or ID!");
      return;
    }

    try {
      const result = await updatePrivacyApi({
        id: currentId,
        data: {
          privacyPolicy: htmlContent,
          type: activeType,
        },
      });

      if (result.status) {
        toast.success("Privacy Policy updated successfully!");
      } else {
        toast.error(result.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update policy!");
    }
  };

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card card-pad">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Content</p>
          <h1 className="page-title">Privacy Policy</h1>
        </div>

          {/* LEFT SIDE - Policy Buttons */}
          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto">
            <button
              onClick={() => handleTypeChange("user")}
              className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${activeType === "user"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              User Policy
            </button>

            <button
              onClick={() => handleTypeChange("driver")}
              className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${activeType === "driver"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Driver Policy
            </button>
          </div>
        </div>
     
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader></Loader>
          </div>
        ) : (
          <div>
            <RichTextEditor
              value={policies[activeType]}
              onChange={handleInputChange}
              className="min-h-[300px] border border-gray-300 rounded-md"
              placeholder={`Enter ${activeType} privacy policy...`}
            />
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              onClick={handleUpdate}
              className="btn-primary w-full sm:w-auto"
            >
              Update Policy
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
