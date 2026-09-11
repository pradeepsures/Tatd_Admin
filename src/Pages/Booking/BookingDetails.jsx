import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import { getSingleBooking, getOutstationBookingDetail, getHourlyBookingDetail, getWeeklyBookingDetail, getMonthlyBookingDetail } from "../../Services/BookingApi";
import { Modal, Select } from "antd";
// import { getAllDrivers } from "../../Services/DriverApi";
import { getUnassignedDriversBySegment } from "../../Services/BookingApi";
import { reassignCancelRequestApi } from "../../Services/RequestApi";
import { toast } from "react-hot-toast";

const { Option } = Select;

// ✅ Field (thin divider)
const Field = ({ label, value }) => {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  return (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-gray-100/80 last:border-b-0 hover:bg-blue-50/30 transition-colors px-2 rounded-lg">
      <span className="text-gray-500 text-sm font-medium tracking-wide">{label}</span>
      <span className="text-gray-900 text-sm font-semibold text-right break-words max-w-[60%]">
        {value}
      </span>
    </div>
  );
};

// ✅ Section
const Section = ({ title, children }) => (
  <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
      <h3 className="text-lg font-bold text-gray-800 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-1">
      {children}
    </div>
  </div>
);

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const type = searchParams.get("type");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [reassignLoading, setReassignLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      let res;
      if (type === "Outstation") {
        res = await getOutstationBookingDetail(id);
      } else if (type === "Hourly") {
        res = await getHourlyBookingDetail(id);
      } else if (type === "Weekly") {
        res = await getWeeklyBookingDetail(id);
      } else if (type === "Monthly") {
        res = await getMonthlyBookingDetail(id);
      } else {
        res = await getSingleBooking(id);
      }
      if (res?.status) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDrivers = async () => {
  try {
    if (!data?.segment?._id) {
      toast.error("Segment not found");
      return;
    }

    const res = await getUnassignedDriversBySegment(data.segment._id);

    if (res?.status) {
      if (!res.data || res.data.length === 0) {
        toast.error("No drivers available for this segment");
        setShowReassignModal(false); // close modal
        return;
      }

      setDrivers(res.data);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (showReassignModal) {
    fetchDrivers();
  }
}, [showReassignModal]);

  // useEffect(() => {
  //   const fetchDrivers = async () => {
  //     try {
  //       const res = await getAllDrivers({ page: 1, rowsPerPage: 100 });
  //       if (res?.status) setDrivers(res.data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchDrivers();
  // }, []);

  if (loading || !data) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* ✅ HEADER */}
      <div className="mb-6 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-primary text-white px-6 py-2.5 rounded-lg font-medium shadow hover:shadow-md transition-all"
        >
          ← Back
        </button>

        <div className="flex justify-between items-center mt-2 mb-4">

          <h2 className="text-2xl font-semibold text-gray-800">
            Booking Details
          </h2>

          {data?.driverResponse?.status === "pending" && data?.overallStatus !== "completed" && (
            <button
              onClick={() => setShowReassignModal(true)}
              className="bg-red-600 text-white px-5 py-2 rounded-lg shadow"
            >
              Reassign Driver
            </button>
          )}

        </div>

        <p className="text-gray-500 text-sm mt-1">
          {data.bookingNumber}
        </p>
      </div>

      <div className="space-y-6">

        {/* BOOKING */}
        <Section title="Booking Info">
          <Field label="BookingId" value={data._id} />
          <Field label="Booking Type" value={data.bookingType} />
          <Field label="Trip Status" value={data.tripStatus} />
          <Field label="Overall Status" value={data.overallStatus} />
          <Field label="Payment Status" value={data.paymentStatus} />
          <Field label="Assignment Status" value={data.assignmentStatus} />
          <Field label="Trip Start Otp" value={data.tripStartOtp} />
          <Field label="Trip End Otp" value={data.tripEndOtp} />
        </Section>


        {/* USER */}
        <Section title="User Info">
          <Field label="Name" value={data.user?.name} />
          <Field label="Email" value={data.user?.email} />
          <Field label="Traveller Name" value={data.travellerName} />
          <Field label="Traveller Phone" value={data.travellerPhone} />
          <Field label="Traveller Email" value={data.travellerEmail} />
        </Section>

        {/* DRIVER */}
        <Section title="Driver Info">
          <Field label="Name" value={data.driver?.name} />
          <Field label="Phone" value={data.driver?.phone} />
          <Field label="Rating" value={data.driver?.rating} />
          <Field label="Online" value={data.driver?.isOnline ? "Yes" : "No"} />
          <Field label="Available" value={data.driver?.isAvailable ? "Yes" : "No"} />
          <Field label="Punched In" value={data.driver?.isPunchedIn ? "Yes" : "No"} />
        </Section>

        {/* VEHICLE */}
        <Section title="Vehicle Info">
          <Field label="Brand" value={data.vehicle?.brand} />
          <Field label="Model" value={data.vehicle?.model} />
          <Field label="Fuel Type" value={data.vehicle?.fuelType} />
          {/* <Field label="Color" value={data.vehicle?.color} /> */}
          <Field label="Car Number" value={data.vehicle?.carNumber} />
          <Field label="Capacity" value={data.vehicle?.capacity} />
        </Section>


        {/* LOCATION */}
        <Section title="Trip Location">
          {/* LEFT SIDE = PICKUP */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Pickup
            </h3>
            <Field label="Address" value={data.pickup?.address} />
            <Field
              label="Date"
              value={data.tripStartAtIST || data.scheduledAtIST || "-"}
            />
          </div>

          {/* RIGHT SIDE = DROP */}
          {data.dropoff && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Drop
              </h3>
              <Field label="Address" value={data.dropoff?.address} />
              <Field
                label="Date"
                value={data.tripEndAtIST || "-"}
              />
            </div>
          )}
        </Section>


        {/* PRICING SNAPSHOT */}
        <Section title="Pricing Snapshot">
          {(!type) && (
            <>
              <Field label="Base Fare" value={data.pricingSnapshot?.baseFare} />
              <Field label="Per KM Rate" value={data.pricingSnapshot?.perKmRate} />
              <Field label="Per Min Rate" value={data.pricingSnapshot?.perMinRate} />
              <Field label="Min Fare" value={data.pricingSnapshot?.minFare} />
              <Field label="Surge" value={data.pricingSnapshot?.surgeMultiplier} />
              <Field label="Time Type" value={data.pricingSnapshot?.timeType} />
              <Field label="Cancellation Fee" value={data.pricingSnapshot?.cancellationFee} />
            </>
          )}

          {type === "Hourly" && (
            <>
              <Field label="Trip Type" value={data.pricingSnapshot?.tripType} />
              <Field label="Per Hour Rate" value={data.pricingSnapshot?.perHourRate} />
              <Field label="Night Fare" value={data.pricingSnapshot?.nightFare} />
              <Field label="Night Window Count" value={data.pricingSnapshot?.nightWindowCount} />
              <Field label="Night Fare Amount" value={data.pricingSnapshot?.nightFareAmount} />
            </>
          )}

          {type === "Outstation" && (
            <>
              <Field label="Round Trip Per Day" value={data.pricingSnapshot?.roundTripPerDayFare} />
              <Field label="One Way Per KM" value={data.pricingSnapshot?.oneWayPerKmRate} />
              <Field label="One Way Base" value={data.pricingSnapshot?.oneWayBaseFare} />
              <Field label="Night Fare" value={data.pricingSnapshot?.nightFare} />
              <Field label="Total Night Fare" value={data.pricingSnapshot?.totalNightFare} />
              <Field label="Service Charge" value={data.pricingSnapshot?.serviceCharge} />
            </>
          )}

          {(type === "Weekly" || type === "Monthly") && (
            <>
              <Field label="Hourly Fare" value={data.pricingSnapshot?.hourlyFare} />
              <Field label="Night Fare" value={data.pricingSnapshot?.nightFare} />
              <Field label="Total Night Fare" value={data.pricingSnapshot?.totalNightFare} />
              <Field label="Service Charge" value={data.pricingSnapshot?.serviceCharge} />
            </>
          )}

          <Field label="GST %" value={data.pricingSnapshot?.gstPercent} />
        </Section>

        {/* PAYMENT */}
        <Section title="Payment Info">
          <Field label="Method" value={data.payment?.method} />
          <Field label="Status" value={data.payment?.status} />
          <Field label="Paid Amount" value={data.payment?.paidAmount} />
          <Field label="Gateway Ref" value={data.payment?.gatewayRef} />
          <Field label="Paid At" value={data.paymentAtIST} />

          <Field label="Extra Amount" value={data.payment?.extraPayment?.amount} />
          <Field label="Extra Status" value={data.payment?.extraPayment?.status} />
        </Section>

        {/* FARE */}
        <Section title="Fare">
          <Field label="Estimated Fare" value={data.estimatedFare} />
          <Field label="Prepaid" value={data.prepaidAmount} />
          
          {(!type || type === "Outstation") && (
            <>
              <Field label="Estimated KM" value={data.estimatedKm} />
              <Field label="Estimated Time" value={data.estimatedMins} />
            </>
          )}

          {type === "Hourly" && (
            <Field label="Booked Hours" value={data.bookedHours} />
          )}

          {(type === "Weekly" || type === "Monthly" || type === "Outstation") && (
            <Field label="Total Days" value={data.totalDays} />
          )}

          {(type === "Weekly" || type === "Monthly") && (
            <Field label="Daily Hours" value={data.dailyHours} />
          )}
        </Section>

        {/* FARE BREAKUP */}
        <Section title="Fare Breakup (Estimated)">
          <Field label="Total Fare" value={data.fareBreakup?.estimated?.totalFare} />
        </Section>

        <Section title="Fare Breakup (Final)">
          <Field label="Total Fare" value={data.fareBreakup?.final?.totalFare} />
        </Section>

        {/* EXTRA */}
        <Section title="Extra Charges">
          <Field label="Amount" value={data.extraCharge?.amount} />
          <Field label="Reason" value={data.extraCharge?.reason} />
          <Field label="Paid" value={data.extraCharge?.isPaid ? "Yes" : "No"} />
        </Section>

        {/* TIMELINE */}
        <Section title="Timeline">
          <Field label="Created At" value={data.createdAtIST} />
          <Field label="Payment At" value={data.paymentAtIST} />
          <Field label="Assigned At" value={data.assignedAtIST} />
          <Field label="Trip Start" value={data.tripStartAtIST} />
          <Field label="Trip End" value={data.tripEndAtIST} />
        </Section>

      </div>

      <Modal
        title="Reassign Driver"
        open={showReassignModal}
        onCancel={() => setShowReassignModal(false)}
        onOk={async () => {
          if (!selectedDriver) return toast.error("Please select driver");

          try {
            setReassignLoading(true);

            await reassignCancelRequestApi(data._id, selectedDriver);

            toast.success("Driver reassigned successfully");

            // ✅ CLOSE FIRST
            setShowReassignModal(false);

            // ✅ RESET STATE
            setSelectedDriver(null);

            // ✅ REFRESH AFTER SMALL DELAY (important)
            setTimeout(() => {
              fetchDetails();
            }, 300);

          } catch (err) {
            console.error(err);
          } finally {
            setReassignLoading(false);
          }
        }}
        confirmLoading={reassignLoading}
      >
        <Select
          showSearch
          placeholder="Select Driver"
          value={selectedDriver || undefined}
          onChange={(val) => setSelectedDriver(val)}
          optionFilterProp="children"
          className="w-full"
        >
          {drivers.map((d) => (
            <Option
              key={d._id}
              value={d._id}
              disabled={d._id === data?.driver?._id}
            >
              {d.name} ({d.phone})
              {d._id === data?.driver?._id && " (Current)"}
            </Option>
          ))}
        </Select>
      </Modal>

    </div>
  );
}