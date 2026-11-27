import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import {
  getSingleBooking,
  getTripBookingDetail,
  getUnassignedDriversBySegment,
} from "../../Services/BookingApi";
import { reassignCancelRequestApi } from "../../Services/RequestApi";
import { Modal, Select } from "antd";
import { toast } from "react-hot-toast";

/* ----------------------------- helpers ----------------------------- */

const isEmpty = (v) => v === null || v === undefined || v === "" || v === "-";

const money = (v) => {
  if (isEmpty(v) || Number.isNaN(Number(v))) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(v));
};

const humanize = (s) =>
  isEmpty(s)
    ? null
    : String(s)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : null;

const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

const fmtTime = (t) => {
  if (isEmpty(t)) return null;
  const [h, m] = String(t).split(":");
  if (m === undefined || Number.isNaN(Number(h))) return t;
  const hour = Number(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusTone = (s) => {
  switch (String(s || "").toLowerCase()) {
    case "completed":
    case "paid":
    case "success":
      return "green";
    case "confirmed":
    case "assigned":
      return "blue";
    case "pending":
    case "not_started":
      return "amber";
    case "cancelled":
    case "failed":
    case "rejected":
      return "red";
    case "in_progress":
    case "driver_enroute":
    case "arrived":
      return "indigo";
    default:
      return "slate";
  }
};

/* --------------------------- small components --------------------------- */

const Badge = ({ label, tone = "slate" }) => {
  if (isEmpty(label)) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const SectionCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`card card-pad ${className}`}>
    <div className="mb-4 border-b border-slate-200/70 pb-3">
      <h3 className="card-title">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Info = ({ label, value, mono = false }) => {
  if (isEmpty(value)) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""
          }`}
      >
        {value}
      </p>
    </div>
  );
};

const InfoGrid = ({ children, cols = 2 }) => (
  <div
    className={`grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""
      }`}
  >
    {children}
  </div>
);

const StatCard = ({ label, value, hint }) => (
  <div className="card card-pad !py-4">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1.5 text-xl font-bold text-slate-900">{value || "—"}</p>
    {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
    {text}
  </div>
);

const Avatar = ({ name }) => (
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold uppercase text-white">
    {(name || "?").trim().charAt(0)}
  </div>
);

/* ------------------------------ main page ------------------------------ */

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
      const res = type ? await getTripBookingDetail(id) : await getSingleBooking(id);
      if (res?.status) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDrivers = async () => {
    try {
      if (!data?.segment?._id) {
        toast.error("Segment not found");
        setShowReassignModal(false);
        return;
      }

      const res = await getUnassignedDriversBySegment(data.segment._id);

      if (res?.status) {
        if (!res.data || res.data.length === 0) {
          toast.error("No drivers available for this segment");
          setShowReassignModal(false);
          return;
        }
        setDrivers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showReassignModal) fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReassignModal]);

  const closeModal = () => {
    setShowReassignModal(false);
    setSelectedDriver(null);
  };

  const handleReassign = async () => {
    if (!selectedDriver) return toast.error("Please select driver");

    try {
      setReassignLoading(true);
      await reassignCancelRequestApi(data._id, selectedDriver);
      toast.success("Driver reassigned successfully");
      closeModal();
      setTimeout(() => fetchDetails(), 300);
    } catch (err) {
      console.error(err);
    } finally {
      setReassignLoading(false);
    }
  };

  const copyBookingId = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (loading || !data) return <Loader />;

  /* ---------- derived values ---------- */
  const pricing = data.pricing || {};
  const snapshot = data.pricingSnapshot || {};
  const payment = data.payment || {};

  const bookingRef = data.bookingId || data.bookingNumber || data._id;
  const bookingStatus = data.status || data.tripStatus || data.overallStatus;
  const paymentStatus = payment.status || data.paymentStatus;

  const total = pricing.totalAmount ?? data.estimatedFare;
  const paid = payment.paidAmount ?? data.prepaidAmount;
  const balance =
    !isEmpty(total) && !isEmpty(paid) ? Number(total) - Number(paid) : null;

  const fareRows = [
    ["Base Fare", pricing.basePrice ?? snapshot.baseFare, true],
    ["Premium Driver Charge", pricing.premiumCharge],
    ["Night Charge", pricing.nightCharge ?? snapshot.nightFare],
    ["Waiting Charge", pricing.waitingCharge],
    ["Extra Charge", pricing.extraCharge ?? data.extraCharge?.amount],
    ["Service Fee", pricing.serviceFee ?? snapshot.serviceCharge],
    ["Driver Salary", pricing.salary],
    ["Tax / GST", pricing.tax],
  ].filter(([, v, always]) => !isEmpty(v) && (Number(v) !== 0 || always));

  const rateCard = [
    ["Per KM Rate", money(snapshot.perKmRate)],
    ["Per Min Rate", money(snapshot.perMinRate)],
    ["Per Hour Rate", money(snapshot.perHourRate)],
    ["Min Fare", money(snapshot.minFare)],
    ["Surge Multiplier", isEmpty(snapshot.surgeMultiplier) ? null : `${snapshot.surgeMultiplier}x`],
    ["Time Type", humanize(snapshot.timeType)],
    ["Cancellation Fee", money(snapshot.cancellationFee)],
    ["Night Window Count", snapshot.nightWindowCount],
    ["Night Fare Amount", money(snapshot.nightFareAmount)],
    ["Total Night Fare", money(snapshot.totalNightFare)],
    ["Round Trip Per Day", money(snapshot.roundTripPerDayFare)],
    ["One Way Per KM", money(snapshot.oneWayPerKmRate)],
    ["One Way Base", money(snapshot.oneWayBaseFare)],
    ["GST", isEmpty(snapshot.gstPercent) ? null : `${snapshot.gstPercent}%`],
  ].filter(([, v]) => !isEmpty(v));

  const pickupDate =
    fmtDate(data.startDate) || data.tripStartAtIST || data.scheduledAtIST;

  const packageLabel = data.package?.hours
    ? `${data.package.hours} Hours${data.package?.basis ? ` · ${humanize(data.package.basis)}` : ""}`
    : data.package?.days || data.totalDays
      ? `${data.package?.days ?? data.totalDays} Days`
      : null;

  const timeline = [
    ["Booking Created", fmtDateTime(data.createdAt) || data.createdAtIST],
    ["Payment Received", fmtDateTime(payment.paidAt) || data.paymentAtIST],
    ["Driver Assigned", data.assignedAtIST],
    ["Trip Started", data.tripStartAtIST],
    ["Trip Ended", data.tripEndAtIST],
    ["Last Updated", fmtDateTime(data.updatedAt)],
  ].filter(([, v]) => !isEmpty(v));

  const canReassign =
    data?.driverResponse?.status === "pending" &&
    data?.overallStatus !== "completed";

  return (
    <div className="page-shell">
      <Breaker />

      {/* ============================ HEADER ============================ */}
      <div className="card card-pad">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-4 !h-9">
          ← Back
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-label">Booking Details</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="page-title break-all">{bookingRef}</h2>
              <button
                onClick={() => copyBookingId(bookingRef)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Copy
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge label={humanize(bookingStatus)} tone={statusTone(bookingStatus)} />
              <Badge
                label={paymentStatus ? `Payment ${humanize(paymentStatus)}` : null}
                tone={statusTone(paymentStatus)}
              />
              <Badge label={humanize(data.bookingType)} tone="slate" />
              <Badge label={humanize(data.tripType)} tone="slate" />
              {data.premiumDriver?.opted && <Badge label="Premium Driver" tone="amber" />}
            </div>
          </div>

          {canReassign && (
            <button
              onClick={() => setShowReassignModal(true)}
              className="btn-danger w-full sm:w-auto"
            >
              Reassign Driver
            </button>
          )}
        </div>
      </div>

      {/* ========================== SUMMARY STATS ========================== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Amount" value={money(total)} />
        <StatCard
          label="Amount Paid"
          value={money(paid)}
          hint={
            balance !== null && balance > 0
              ? `Balance ${money(balance)}`
              : balance === 0
                ? "Fully paid"
                : null
          }
        />
        <StatCard
          label="Pickup Date"
          value={pickupDate}
          hint={fmtTime(data.startTime)}
        />
        <StatCard label="Package" value={packageLabel} hint={data.city?.name} />
      </div>

      {/* ============================== BODY ============================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ------------------------- LEFT / MAIN ------------------------- */}
        <div className="space-y-5 lg:col-span-2">
          {/* Trip details */}
          <SectionCard title="Trip Details">
            <InfoGrid cols={3}>
              <Info label="Booking Type" value={humanize(data.bookingType)} />
              <Info label="Trip Type" value={humanize(data.tripType)} />
              <Info label="Assignment" value={humanize(data.assignmentStatus)} />
              <Info label="Package Basis" value={humanize(data.package?.basis)} />
              <Info label="Package Hours" value={data.package?.hours ?? data.bookedHours} />
              <Info label="Total Days" value={data.package?.days ?? data.totalDays} />
              <Info label="Daily Hours" value={data.dailyHours} />
              <Info label="Estimated KM" value={data.estimatedKm} />
              <Info label="Estimated Time" value={data.estimatedMins} />
              <Info
                label="Premium Driver"
                value={
                  data.premiumDriver?.opted === undefined
                    ? null
                    : data.premiumDriver.opted
                      ? `Yes${money(data.premiumDriver.price) ? ` (${money(data.premiumDriver.price)})` : ""}`
                      : "No"
                }
              />
              <Info label="Start OTP" value={data.tripStartOtp} mono />
              <Info label="End OTP" value={data.tripEndOtp} mono />
            </InfoGrid>

            {!isEmpty(data.notes) && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  Customer Notes
                </p>
                <p className="mt-1 text-sm text-amber-900">{data.notes}</p>
              </div>
            )}
          </SectionCard>

          {/* Route */}
          <SectionCard title="Trip Route" subtitle={data.city?.name ? `City: ${data.city.name}` : undefined}>
            <div className="space-y-0">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  {data.dropoff && <span className="my-1 w-px flex-1 bg-slate-200" />}
                </div>
                <div className={`min-w-0 flex-1 ${data.dropoff ? "pb-6" : ""}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Pickup
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {data.pickup?.address || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[pickupDate, fmtTime(data.startTime)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {data.dropoff && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                      Drop
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {data.dropoff?.address || "—"}
                    </p>
                    {data.tripEndAtIST && (
                      <p className="mt-1 text-xs text-slate-500">{data.tripEndAtIST}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Fare summary */}
          <SectionCard title="Fare Summary">
            <div className="divide-y divide-slate-100">
              {fareRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="text-sm font-semibold text-slate-800">{money(value)}</span>
                </div>
              ))}
              {Number(pricing.discount) > 0 && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">Discount</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    − {money(pricing.discount)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2 rounded-lg bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Amount</span>
                <span className="text-lg font-bold text-slate-900">{money(total) || "—"}</span>
              </div>
              {!isEmpty(paid) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Paid</span>
                  <span className="text-sm font-semibold text-emerald-600">{money(paid)}</span>
                </div>
              )}
              {balance !== null && balance > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Balance Due</span>
                  <span className="text-sm font-semibold text-rose-600">{money(balance)}</span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Fare breakup */}
          {(!isEmpty(data.fareBreakup?.estimated?.totalFare) ||
            !isEmpty(data.fareBreakup?.final?.totalFare)) && (
              <SectionCard title="Fare Breakup">
                <InfoGrid>
                  <Info label="Estimated Total Fare" value={money(data.fareBreakup?.estimated?.totalFare)} />
                  <Info label="Final Total Fare" value={money(data.fareBreakup?.final?.totalFare)} />
                </InfoGrid>
              </SectionCard>
            )}

          {/* Rate card */}
          {rateCard.length > 0 && (
            <SectionCard title="Pricing Snapshot" subtitle="Rates applied at the time of booking">
              <InfoGrid cols={3}>
                {rateCard.map(([label, value]) => (
                  <Info key={label} label={label} value={value} />
                ))}
              </InfoGrid>
            </SectionCard>
          )}

          {/* Extra charges */}
          {(!isEmpty(data.extraCharge?.amount) ||
            Number(data.trip?.waitingMinutes) > 0) && (
              <SectionCard title="Extra Charges">
                <InfoGrid>
                  <Info label="Amount" value={money(data.extraCharge?.amount ?? pricing.extraCharge)} />
                  <Info label="Reason" value={data.extraCharge?.reason} />
                  <Info
                    label="Paid"
                    value={
                      data.extraCharge?.isPaid === undefined
                        ? null
                        : data.extraCharge.isPaid
                          ? "Yes"
                          : "No"
                    }
                  />
                  <Info
                    label="Waiting Minutes"
                    value={Number(data.trip?.waitingMinutes) > 0 ? data.trip.waitingMinutes : null}
                  />
                </InfoGrid>
              </SectionCard>
            )}
        </div>

        {/* ------------------------- RIGHT / SIDEBAR ------------------------- */}
        <div className="space-y-5">
          {/* Customer */}
          <SectionCard title="Customer">
            <div className="flex items-center gap-3">
              <Avatar name={data.user?.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {data.user?.name || "—"}
                </p>
                <p className="truncate text-xs text-slate-500">{data.user?.email}</p>
              </div>
            </div>
            {(data.travellerName || data.travellerPhone || data.travellerEmail) && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <Info label="Traveller Name" value={data.travellerName} />
                <Info label="Traveller Phone" value={data.travellerPhone} />
                <Info label="Traveller Email" value={data.travellerEmail} />
              </div>
            )}
          </SectionCard>

          {/* Driver */}
          <SectionCard title="Driver">
            {data.driver ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar name={data.driver?.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {data.driver?.name}
                    </p>
                    <p className="text-xs text-slate-500">{data.driver?.phone}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {!isEmpty(data.driver?.rating) && (
                    <Badge label={`Rating ${data.driver.rating}`} tone="amber" />
                  )}
                  <Badge
                    label={data.driver?.isOnline ? "Online" : "Offline"}
                    tone={data.driver?.isOnline ? "green" : "slate"}
                  />
                  <Badge
                    label={data.driver?.isAvailable ? "Available" : "Unavailable"}
                    tone={data.driver?.isAvailable ? "green" : "slate"}
                  />
                  <Badge
                    label={data.driver?.isPunchedIn ? "Punched In" : "Not Punched In"}
                    tone={data.driver?.isPunchedIn ? "blue" : "slate"}
                  />
                </div>
              </>
            ) : (
              <EmptyState text="No driver assigned yet" />
            )}
          </SectionCard>

          {/* Vehicle */}
          <SectionCard title="Vehicle">
            <div className="space-y-3">
              <Info
                label="Vehicle"
                value={
                  [
                    data.vehicle?.carBrand || data.vehicle?.brand,
                    data.vehicle?.carModel || data.vehicle?.model,
                  ]
                    .filter(Boolean)
                    .join(" ") || null
                }
              />
              <Info label="Car Number" value={data.vehicle?.carNumber} mono />
              <Info
                label="Fuel Type"
                value={humanize(data.vehicle?.fuel || data.vehicle?.fuelType)}
              />
              <Info label="Transmission" value={humanize(data.vehicle?.transmission)} />
              <Info label="Capacity" value={data.vehicle?.capacity} />
            </div>
          </SectionCard>

          {/* Payment */}
          <SectionCard title="Payment">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </span>
                <Badge label={humanize(paymentStatus)} tone={statusTone(paymentStatus)} />
              </div>
              <Info label="Method" value={humanize(payment.method)} />
              <Info label="Paid Amount" value={money(payment.paidAmount)} />
              <Info label="Paid At" value={fmtDateTime(payment.paidAt) || data.paymentAtIST} />
              <Info label="Order ID" value={payment.orderId} mono />
              <Info label="Transaction ID" value={payment.transactionId} mono />
              <Info label="Gateway Ref" value={payment.gatewayRef} mono />
              <Info label="Extra Payment" value={money(payment.extraPayment?.amount)} />
              <Info label="Extra Payment Status" value={humanize(payment.extraPayment?.status)} />
            </div>
          </SectionCard>

          {/* Timeline */}
          {timeline.length > 0 && (
            <SectionCard title="Timeline">
              <ol className="relative space-y-5 border-l border-slate-200 pl-5">
                {timeline.map(([label, value]) => (
                  <li key={label} className="relative">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-slate-900 ring-4 ring-white" />
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{value}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}
        </div>
      </div>

      {/* ============================ MODAL ============================ */}
      <Modal
        title="Reassign Driver"
        open={showReassignModal}
        onCancel={closeModal}
        onOk={handleReassign}
        okText="Reassign"
        confirmLoading={reassignLoading}
      >
        {data?.driver && (
          <p className="mb-3 text-sm text-slate-500">
            Current driver:{" "}
            <span className="font-semibold text-slate-800">{data.driver.name}</span>
          </p>
        )}
        <Select
          showSearch
          placeholder="Select Driver"
          value={selectedDriver || undefined}
          onChange={(val) => setSelectedDriver(val)}
          optionFilterProp="label"
          className="w-full"
          options={drivers.map((d) => ({
            value: d._id,
            label: `${d.name} (${d.phone})${d._id === data?.driver?._id ? " (Current)" : ""}`,
            disabled: d._id === data?.driver?._id,
          }))}
        />
      </Modal>
    </div>
  );
}