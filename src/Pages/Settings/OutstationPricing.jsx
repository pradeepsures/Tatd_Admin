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
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">Outstation Pricing Configuration</h2>
          <p className="page-subtitle">Manage global pricing settings for Outstation Bookings</p>
        </div>
      </div>

      <div className="card p-5 sm:p-8 max-w-4xl">
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          <div>
            <label className="field-label">Round Trip Per Day Fare (₹)</label>
            <input
              type="number"
              value={roundTripPerDayFare}
              onChange={(e) => setRoundTripPerDayFare(e.target.value)}
              className="field"
              placeholder="1000"
              required
            />
          </div>

          <div>
            <label className="field-label">One Way Base Fare (₹)</label>
            <input
              type="number"
              value={oneWayBaseFare}
              onChange={(e) => setOneWayBaseFare(e.target.value)}
              className="field"
              placeholder="500"
              required
            />
          </div>

          <div>
            <label className="field-label">One Way Per Km Rate (₹)</label>
            <input
              type="number"
              value={oneWayPerKmRate}
              onChange={(e) => setOneWayPerKmRate(e.target.value)}
              className="field"
              placeholder="12"
              required
            />
          </div>

          <div>
            <label className="field-label">Night Fare (₹)</label>
            <input
              type="number"
              value={nightFare}
              onChange={(e) => setNightFare(e.target.value)}
              className="field"
              placeholder="200"
              required
            />
          </div>
          
          <div>
            <label className="field-label">Service Charge (₹)</label>
            <input
              type="number"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              className="field"
              placeholder="50"
              required
            />
          </div>
          
          <div>
            <label className="field-label">GST Percent (%)</label>
            <input
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className="field"
              placeholder="5"
              required
            />
          </div>

          <div className="flex items-center rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="ml-3 cursor-pointer text-sm font-semibold text-slate-700">
              Is Active
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto"
            >
              {saving ? <LoderBtn /> : "Save Pricing"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
