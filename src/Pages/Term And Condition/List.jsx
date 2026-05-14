import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "react-rte";
import "react-rte/lib/RichTextEditor.css";
import { updateTermApi, getAllTerm } from "../../Services/TermAndConditionApi";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

const TermCondition = () => {

  const [activeType, setActiveType] = useState("user");

  const [terms, setTerms] = useState({
    user: RichTextEditor.createEmptyValue(),
    driver: RichTextEditor.createEmptyValue(),
  });

  const [termIds, setTermIds] = useState({
    user: "",
    driver: "",
  });

  const [loading, setLoading] = useState(false);

  const fetchTerms = async () => {
    setLoading(true);

    try {

      const result = await getAllTerm({
        page: 1,
        rowsPerPage: 10,
        searchQuery: ""
      });

      const data = result.data || [];

      const userData = data.find(item => item.type === "user");
      const driverData = data.find(item => item.type === "driver");

      setTerms({
        user: RichTextEditor.createValueFromString(
          userData?.termCondition || "",
          "html"
        ),
        driver: RichTextEditor.createValueFromString(
          driverData?.termCondition || "",
          "html"
        ),
      });

      setTermIds({
        user: userData?._id || "",
        driver: driverData?._id || "",
      });

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to fetch terms!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleTypeChange = (type) => {
    setActiveType(type);
  };

  const handleInputChange = (value) => {
    setTerms((prev) => ({
      ...prev,
      [activeType]: value,
    }));
  };

  const handleUpdate = async () => {

    const currentId = termIds[activeType];
    const htmlContent = terms[activeType].toString("html");

    if (!currentId) {
      toast.error("No ID found!");
      return;
    }

    if (!htmlContent || htmlContent.trim() === "<p><br></p>") {
      toast.error("Term content cannot be empty!");
      return;
    }

    const payload = {
      termCondition: htmlContent,
      type: activeType
    };

    try {

      const result = await updateTermApi({
        id: currentId,
        data: payload
      });

      if (result.status) {
        toast.success("Terms updated successfully!");
      } else {
        toast.error(result.message || "Update failed!");
      }

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update terms!");
    }

  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">

      <div className="mb-6">
        <Breaker />
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">

        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Terms and Conditions
        </h1>

        <div className="flex space-x-4 mb-6">

          <button
            onClick={() => handleTypeChange("user")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              activeType === "user"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            User Terms
          </button>

          <button
            onClick={() => handleTypeChange("driver")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              activeType === "driver"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Driver Terms
          </button>

        </div>

        {loading ? (
          <div className="text-center text-red-600">
            <Loader />
          </div>
        ) : (
          <div>

            <RichTextEditor
              value={terms[activeType]}
              onChange={handleInputChange}
              className="min-h-[300px] border border-gray-300 rounded-md"
              placeholder={`Enter ${activeType} terms and conditions...`}
            />

            <button
              onClick={handleUpdate}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:opacity-90 transition"
            >
              Update Terms
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default TermCondition;