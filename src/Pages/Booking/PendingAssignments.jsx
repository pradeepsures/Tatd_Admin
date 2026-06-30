import BookingList from "../Booking/BookingList";

export default function PendingAssignments() {
  return (
    <BookingList
      pageTitle="Pending Trip Assignment"
      pageDescription="Trips waiting for a driver. Click Assign to link a chauffeur and vehicle."
      presetFilters={{ assignmentStatus: "unassigned" }}
    />
  );
}
