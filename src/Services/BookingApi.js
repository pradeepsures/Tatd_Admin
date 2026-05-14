import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// GET ALL BOOKINGS


export const getAllBookings = async ({

  page,
  rowsPerPage,
  searchQuery,
  startDate,
  endDate,
  overallStatus,
  tripStatus,
  paymentStatus,
  assignmentStatus,
  bookingType,
  region,
  segment,
  driverName,
  driverPhone,
  carNumber,
}) => {
  const token = localStorage.getItem("token");

  try {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", rowsPerPage);

    if (searchQuery) params.append("search", searchQuery);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    if (overallStatus) params.append("overallStatus", overallStatus);
    if (tripStatus) params.append("tripStatus", tripStatus);
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (assignmentStatus) params.append("assignmentStatus", assignmentStatus);
    if (bookingType) params.append("bookingType", bookingType);

    if (region) params.append("region", region);
    if (segment) params.append("segment", segment);

    if (driverName) params.append("driverName", driverName);
    if (driverPhone) params.append("driverPhone", driverPhone);
    if (carNumber) params.append("carNumber", carNumber);

    const res = await fetch(
      `${BASE_URL}/api/admin/booking?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch bookings");
    throw err;
  }
};


// GET SINGLE BOOKING DETAILS
export const getSingleBooking = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/booking/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch booking details");
    throw err;
  }
};

export const assignDriver = async (bookingId, driverId) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/assignDriver/${bookingId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId }),
      }
    );

    const result = await res.json();

    // If backend sends error response
    if (!res.ok || result.status === false) {
      const errorMessage =
        result.message || "Failed to assign driver";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Success toast from backend message
    toast.success(result.message || "Driver assigned successfully");

    return result;

  } catch (err) {
    toast.error(err.message || "Something went wrong");
    throw err;
  }
};

// export const assignDriver = async (bookingId, driverId) => {
//   const token = localStorage.getItem("token");

//   try {
//     const res = await fetch(
//       `${BASE_URL}/api/admin/assignDriver/${bookingId}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ driverId }),
//       }
//     );

//     return await res.json();
//   } catch (err) {
//     throw err;
//   }
// };


export const getUnassignedDriversBySegment = async (segmentId, search = "") => {
  const token = localStorage.getItem("token");

  try {
    const params = new URLSearchParams();

    if (segmentId) params.append("segment", segmentId);
    if (search) params.append("search", search);

    const res = await fetch(
      `${BASE_URL}/api/admin/unAssignDriverList?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error("Failed to fetch unassigned drivers");
    throw err;
  }
};