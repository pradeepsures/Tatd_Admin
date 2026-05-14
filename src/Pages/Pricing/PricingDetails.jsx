import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "antd";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getPricingApi } from "../../Services/PricingApi";

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
  if (!data) return <div>No Data Found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Pricing Details</h2>

      {/* BASIC INFO */}
      <Card title="Basic Info" className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Booking Type:</strong> {data.bookingType}</p>
          <p><strong>Region:</strong> {data.region?.name}</p>
          <p><strong>State:</strong> {data.region?.state}</p>
          <p><strong>Segment:</strong> {data.segment?.name}</p>
          <p><strong>Capacity:</strong> {data.segment?.maxCapacity}</p>
          <p><strong>GST %:</strong> {data.gstPercent}</p>
          <p><strong>Surge Mode:</strong> {data.surgeActive}</p>
          <p><strong>Active:</strong> {showValue(data.isActive)}</p>
          <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(data.updatedAt).toLocaleString()}</p>
        </div>
      </Card>

      {/* DAY */}
      <Card title="Day Pricing" className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <p>Base Fare: ₹{showValue(data.day?.baseFare)}</p>
          <p>Per Km: ₹{showValue(data.day?.perKmRate)}</p>
          <p>Per Min: ₹{showValue(data.day?.perMinRate)}</p>
          <p>Min Fare: ₹{showValue(data.day?.minFare)}</p>
          <p>Cancellation Fee: ₹{showValue(data.day?.cancellationFee)}</p>
        </div>
      </Card>

      {/* NIGHT */}
      <Card title="Night Pricing" className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <p>Base Fare: ₹{showValue(data.night?.baseFare)}</p>
          <p>Per Km: ₹{showValue(data.night?.perKmRate)}</p>
          <p>Per Min: ₹{showValue(data.night?.perMinRate)}</p>
          <p>Min Fare: ₹{showValue(data.night?.minFare)}</p>
          <p>Cancellation Fee: ₹{showValue(data.night?.cancellationFee)}</p>
        </div>
      </Card>

      {/* HOURLY PACKAGE */}
      <Card title="Hourly Package" className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <p>Hours: {showValue(data.hourlyPackage?.hours)}</p>
          <p>Included Kms: {showValue(data.hourlyPackage?.includedKms)}</p>
          <p>Package Fare: ₹{showValue(data.hourlyPackage?.packageFare)}</p>
          <p>Extra Per Km: ₹{showValue(data.hourlyPackage?.extraPerKm)}</p>
          <p>Extra Per Min: ₹{showValue(data.hourlyPackage?.extraPerMin)}</p>
        </div>
      </Card>

      {/* DRIVER FARE */}
      <Card title="Driver Fare" className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <p>Per Km Rate: ₹{showValue(data.driverFare?.perKmRate)}</p>
          <p>Flat Per Trip: ₹{showValue(data.driverFare?.flatPerTrip)}</p>
          <p>Min Guarantee: ₹{showValue(data.driverFare?.minGuarantee)}</p>
          <p>Allowance Per Day: ₹{showValue(data.driverFare?.allowancePerDay)}</p>
          <p>Toll Included: {showValue(data.driverFare?.tollIncluded)}</p>
        </div>
      </Card>

      {/* SURGE WINDOWS */}
      <Card title="Surge Windows" className="mb-6">
        {data.surgeWindows?.length > 0 ? (
          data.surgeWindows.map((item, i) => (
            <div key={i} className="border p-4 mb-3 rounded bg-gray-100">

              <p><strong>Label:</strong> {item.label}</p>
              <p><strong>Type:</strong> {item.type}</p>

              <p><strong>From:</strong> {showValue(item.fromHour)}:{showValue(item.fromMin)}</p>
              <p><strong>To:</strong> {showValue(item.toHour)}:{showValue(item.toMin)}</p>

              <p><strong>Multiplier:</strong> {item.multiplier}x</p>
              <p><strong>Active:</strong> {showValue(item.isActive)}</p>
            </div>
          ))
        ) : (
          <p>No Surge Windows</p>
        )}
      </Card>


      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="bg-blue-600 text-white px-6 py-2 rounded mt-6"
      >
        Back
      </button>
    </div>
  );
}