import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getOutstationPricing, updateOutstationPricing } from "../../Services/SettingsApi";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";

export default function OutstationPricing() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [roundTripPerDayFare, setRoundTripPerDayFare] = useState(1000);
  const [oneWayPerKmRate, setOneWayPerKmRate] = useState(12);
  const [oneWayBaseFare, setOneWayBaseFare] = useState(500);
  const [nightFare, setNightFare] = useState(200);
  const [serviceCharge, setServiceCharge] = useState(50);
  const [gstPercent, setGstPercent] = useState(5);
  const [isActive, setIsActive] = useState(true);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await getOutstationPricing();
      if (res?.status) {
        const data = res.data;
        setRoundTripPerDayFare(data.roundTripPerDayFare || 1000);
        setOneWayPerKmRate(data.oneWayPerKmRate || 12);
        setOneWayBaseFare(data.oneWayBaseFare || 500);
        setNightFare(data.nightFare || 200);
        setServiceCharge(data.serviceCharge || 50);
        setGstPercent(data.gstPercent || 5);
        setIsActive(data.isActive ?? true);
      }
    } catch (err) {
      toast.error("Failed to load Outstation Pricing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        roundTripPerDayFare: Number(roundTripPerDayFare),
        oneWayPerKmRate: Number(oneWayPerKmRate),
        oneWayBaseFare: Number(oneWayBaseFare),
        nightFare: Number(nightFare),
        serviceCharge: Number(serviceCharge),
        gstPercent: Number(gstPercent),
        isActive,
      };
      const res = await updateOutstationPricing(payload);
      if (res?.status) {
        toast.success("Outstation Pricing updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update Outstation Pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold">Outstation Pricing Configuration</h2>
        <p className="text-sm opacity-80 mt-1">Manage global pricing settings for Outstation Bookings</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Round Trip Per Day Fare (₹)</label>
            <input
              type="number"
              value={roundTripPerDayFare}
              onChange={(e) => setRoundTripPerDayFare(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="1000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">One Way Base Fare (₹)</label>
            <input
              type="number"
              value={oneWayBaseFare}
              onChange={(e) => setOneWayBaseFare(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">One Way Per Km Rate (₹)</label>
            <input
              type="number"
              value={oneWayPerKmRate}
              onChange={(e) => setOneWayPerKmRate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Night Fare (₹)</label>
            <input
              type="number"
              value={nightFare}
              onChange={(e) => setNightFare(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (₹)</label>
            <input
              type="number"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Percent (%)</label>
            <input
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="5"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900">
              Is Active
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {saving ? <LoderBtn /> : "Save Pricing"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
