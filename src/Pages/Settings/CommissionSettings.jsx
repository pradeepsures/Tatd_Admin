import React, { useState, useEffect } from "react";
import { getCommissionSettings, updateCommissionSettings } from "../../Services/SettingsApi";
import toast from "react-hot-toast";

const CommissionSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    freeRidesCount: 5,
    globalDriverCommission: 10,
  });

  const fetchSettings = async () => {
    try {
      const res = await getCommissionSettings();
      if (res.success && res.data) {
        setFormData({
          freeRidesCount: res.data.freeRidesCount || 0,
          globalDriverCommission: res.data.globalDriverCommission || 0,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch commission settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateCommissionSettings(formData);
      if (res.success) {
        toast.success("Commission Settings Updated Successfully");
      } else {
        toast.error(res.message || "Update Failed");
      }
    } catch (error) {
      toast.error("Error updating settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card p-5 sm:p-8 mx-auto w-full max-w-xl">
        <div className="mb-6 border-b border-slate-200/70 pb-5">
          <p className="section-label">Settings</p>
          <h2 className="page-title">
            Driver Commission Settings
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Free Rides */}
          <div>
            <label className="field-label">
              Free Rides for New Drivers
            </label>
            <input
              type="number"
              name="freeRidesCount"
              value={formData.freeRidesCount}
              onChange={handleChange}
              min="0"
              className="field"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Commission will be 0% for these first N rides.
            </p>
          </div>

          {/* Commission % */}
          <div>
            <label className="field-label">
              Default Commission Percentage (%)
            </label>
            <input
              type="number"
              name="globalDriverCommission"
              value={formData.globalDriverCommission}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="field"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Commission percentage taken by admin after free rides are over.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommissionSettings;
