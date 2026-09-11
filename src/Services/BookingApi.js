import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

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

export const getTripCancelRequests = async ({ page = 1, limit = 10, status = "" } = {}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams({ page, limit });
  if (status) params.append("status", status);

  const res = await fetch(`${BASE_URL}/api/admin/tripCancelRequests?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const updateTripCancelRequest = async (id, body) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/tripCancelRequests/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};

// ==========================================
// HOURLY BOOKINGS API
// ==========================================

export const getAllHourlyBookings = async (filters) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });

  const res = await fetch(`${BASE_URL}/api/admin/hourlyBookings?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getHourlyBookingDetail = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/hourlyBookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const assignHourlyDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/hourlyBookings/${id}/assign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const reassignHourlyDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/hourlyBookings/${id}/reassign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const getUnassignedHourlyDrivers = async (bookingId, search = "") => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (bookingId) params.append("bookingId", bookingId);
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}/api/admin/unassignedHourlyDrivers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// ==========================================
// WEEKLY BOOKINGS API
// ==========================================

export const getAllWeeklyBookings = async (filters) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });

  const res = await fetch(`${BASE_URL}/api/admin/weeklyBookings?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getWeeklyBookingDetail = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/weeklyBookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const assignWeeklyDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/weeklyBookings/${id}/assign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const reassignWeeklyDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/weeklyBookings/${id}/reassign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const getUnassignedWeeklyDrivers = async (bookingId, search = "") => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (bookingId) params.append("bookingId", bookingId);
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}/api/admin/unassignedweeklyDrivers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// ==========================================
// MONTHLY BOOKINGS API
// ==========================================

export const getAllMonthlyBookings = async (filters) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });

  const res = await fetch(`${BASE_URL}/api/admin/monthlyBookings?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getMonthlyBookingDetail = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/monthlyBookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const assignMonthlyDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/monthlyBookings/${id}/assign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const reassignMonthlyDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/monthlyBookings/${id}/reassign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const getUnassignedMonthlyDrivers = async (bookingId, search = "") => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (bookingId) params.append("bookingId", bookingId);
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}/api/admin/unassignedmonthlyDrivers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// ==========================================
// OUTSTATION BOOKINGS API
// ==========================================

export const getAllOutstationBookings = async (filters) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });

  const res = await fetch(`${BASE_URL}/api/admin/outstationBookings?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getOutstationBookingDetail = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/outstationBookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const assignOutstationDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/outstationBookings/${id}/assign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const reassignOutstationDriver = async (id, driverId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/admin/outstationBookings/${id}/reassign-driver`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

export const getUnassignedOutstationDrivers = async (bookingId, search = "") => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (bookingId) params.append("bookingId", bookingId);
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}/api/admin/unassignedoutstationDrivers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
