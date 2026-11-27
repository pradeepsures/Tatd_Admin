export const getBookingStatus = (booking) =>
  booking.status || booking.tripStatus || booking.overallStatus || "-";

export const getPaymentStatus = (booking) =>
  booking.payment?.status || booking.paymentStatus || "-";

export const getBookingAmount = (booking) =>
  booking.pricing?.totalAmount ?? booking.estimatedFare ?? "-";

export const getBookingReference = (booking) =>
  booking.bookingId || booking.bookingNumber || booking._id;

export const getBookingDate = (booking) => {
  const value = booking.startDate || booking.scheduledAt;
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const dateLabel = date.toLocaleDateString();
  return booking.startTime
    ? `${dateLabel} ${booking.startTime}`
    : date.toLocaleString();
};

export const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "completed") return "badge-success";
  if (normalized === "cancelled" || normalized === "canceled") return "badge-danger";
  if (normalized === "paid") return "badge-success";
  if (normalized === "in_progress" || normalized === "ongoing") return "badge-info";
  if (normalized === "confirmed") return "badge-info";
  return "badge-warning";
};
