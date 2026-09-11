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
    <div className="p-4 sm:p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Driver Commission Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Free Rides */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Rides for New Drivers
            </label>
            <input
              type="number"
              name="freeRidesCount"
              value={formData.freeRidesCount}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Commission will be 0% for these first N rides.
            </p>
          </div>

          {/* Commission % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Commission percentage taken by admin after free rides are over.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommissionSettings;
