import React, { useState, useEffect } from "react";
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
  const [activeType, setActiveType] = useState("user");
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
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="mb-6">
        <Breaker />
      </div>
      <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Privacy Policy</h1>

        <div className="flex justify-between items-center mb-6">

          {/* LEFT SIDE - Policy Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => handleTypeChange("user")}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeType === "user"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              User Policy
            </button>

            <button
              onClick={() => handleTypeChange("driver")}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeType === "driver"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              Driver Policy
            </button>
          </div>
        </div>
     
        {loading ? (
          <div className="text-center text-red-600">
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
            <button
              onClick={handleUpdate}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Update Policy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
