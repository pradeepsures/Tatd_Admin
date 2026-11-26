import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getPricingApi } from "../../Services/PricingApi";

// Presentational helpers
const Section = ({ title, children }) => (
  <div className="card card-pad">
    <div className="mb-5 border-b border-slate-200/70 pb-3">
      <h3 className="card-title">{title}</h3>
    </div>
    {children}
  </div>
);

const Item = ({ label, children }) => (
  <div className="rounded-xl bg-white/60 px-4 py-3 ring-1 ring-slate-900/5">
    <p className="detail-label">{label}</p>
    <p className="detail-value">{children}</p>
  </div>
);

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

// ✅ HELPER
const showValue = (val) => {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return val;
};

export default function PricingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH
  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getPricingApi(id);

      if (res?.status) {
        setData(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return <div className="py-14 text-center text-slate-400">No Data Found</div>;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="section-label">Pricing</p>
          <h1 className="page-title">Pricing Details</h1>
        </div>
        <div className="page-actions">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      {/* BASIC INFO */}
      <Section title="Basic Info">
        <div className={GRID}>
          <Item label="Booking Type">{data.bookingType}</Item>
          <Item label="Region">{data.region?.name}</Item>
          <Item label="State">{data.region?.state}</Item>
          <Item label="Segment">{data.segment?.name}</Item>
          <Item label="Capacity">{data.segment?.maxCapacity}</Item>
          <Item label="GST %">{data.gstPercent}</Item>
          <Item label="Surge Mode">{data.surgeActive}</Item>
          <Item label="Active">{showValue(data.isActive)}</Item>
          <Item label="Created At">{new Date(data.createdAt).toLocaleString()}</Item>
          <Item label="Updated At">{new Date(data.updatedAt).toLocaleString()}</Item>
        </div>
      </Section>

      {/* DAY */}
      <Section title="Day Pricing">
        <div className={GRID}>
          <Item label="Base Fare">₹{showValue(data.day?.baseFare)}</Item>
          <Item label="Per Km">₹{showValue(data.day?.perKmRate)}</Item>
          <Item label="Per Min">₹{showValue(data.day?.perMinRate)}</Item>
          <Item label="Min Fare">₹{showValue(data.day?.minFare)}</Item>
          <Item label="Cancellation Fee">₹{showValue(data.day?.cancellationFee)}</Item>
        </div>
      </Section>

      {/* NIGHT */}
      <Section title="Night Pricing">
        <div className={GRID}>
          <Item label="Base Fare">₹{showValue(data.night?.baseFare)}</Item>
          <Item label="Per Km">₹{showValue(data.night?.perKmRate)}</Item>
          <Item label="Per Min">₹{showValue(data.night?.perMinRate)}</Item>
          <Item label="Min Fare">₹{showValue(data.night?.minFare)}</Item>
          <Item label="Cancellation Fee">₹{showValue(data.night?.cancellationFee)}</Item>
        </div>
      </Section>

      {/* HOURLY PACKAGE */}
      <Section title="Hourly Package">
        <div className={GRID}>
          <Item label="Hours">{showValue(data.hourlyPackage?.hours)}</Item>
          <Item label="Included Kms">{showValue(data.hourlyPackage?.includedKms)}</Item>
          <Item label="Package Fare">₹{showValue(data.hourlyPackage?.packageFare)}</Item>
          <Item label="Extra Per Km">₹{showValue(data.hourlyPackage?.extraPerKm)}</Item>
          <Item label="Extra Per Min">₹{showValue(data.hourlyPackage?.extraPerMin)}</Item>
        </div>
      </Section>

      {/* DRIVER FARE */}
      <Section title="Driver Fare">
        <div className={GRID}>
          <Item label="Per Km Rate">₹{showValue(data.driverFare?.perKmRate)}</Item>
          <Item label="Flat Per Trip">₹{showValue(data.driverFare?.flatPerTrip)}</Item>
          <Item label="Min Guarantee">₹{showValue(data.driverFare?.minGuarantee)}</Item>
          <Item label="Allowance Per Day">₹{showValue(data.driverFare?.allowancePerDay)}</Item>
          <Item label="Toll Included">{showValue(data.driverFare?.tollIncluded)}</Item>
        </div>
      </Section>

      {/* SURGE WINDOWS */}
      <Section title="Surge Windows">
        {data.surgeWindows?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {data.surgeWindows.map((item, i) => (
            <div key={i} className="rounded-xl bg-white/60 p-4 ring-1 ring-slate-900/5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div><p className="detail-label">Label</p><p className="detail-value">{item.label}</p></div>
                <div><p className="detail-label">Type</p><p className="detail-value">{item.type}</p></div>

                <div><p className="detail-label">From</p><p className="detail-value">{showValue(item.fromHour)}:{showValue(item.fromMin)}</p></div>
                <div><p className="detail-label">To</p><p className="detail-value">{showValue(item.toHour)}:{showValue(item.toMin)}</p></div>

                <div><p className="detail-label">Multiplier</p><p className="detail-value">{item.multiplier}x</p></div>
                <div><p className="detail-label">Active</p><p className="detail-value">{showValue(item.isActive)}</p></div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">No Surge Windows</p>
        )}
      </Section>
    </div>
  );
}
