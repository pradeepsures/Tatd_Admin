import React, { useState, useEffect } from "react";
import useAdminListState from "../../hooks/useAdminListState";
import toast from "react-hot-toast";
import RichTextEditor from "react-rte";
import "react-rte/lib/RichTextEditor.css";
import { updateTermApi, getAllTerm } from "../../Services/TermAndConditionApi";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

const TermCondition = () => {

  const [activeType, setActiveType] = useAdminListState("activeType", "user");

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
    <div className="page-shell">

      <Breaker />

      <div className="card card-pad">

        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Content</p>
          <h1 className="page-title">
            Terms and Conditions
          </h1>
        </div>

        <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto">

          <button
            onClick={() => handleTypeChange("user")}
            className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeType === "user"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            User Terms
          </button>

          <button
            onClick={() => handleTypeChange("driver")}
            className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeType === "driver"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Driver Terms
          </button>

        </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
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

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              onClick={handleUpdate}
              className="btn-primary w-full sm:w-auto"
            >
              Update Terms
            </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TermCondition;