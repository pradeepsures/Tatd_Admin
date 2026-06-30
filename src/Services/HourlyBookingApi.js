import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get All Hourly Bookings (search + filters + pagination)
// ────────────────────────────────────────────────
export const getAllHourlyBookings = async ({
  page = 1,
  rowsPerPage = 15,
  searchQuery = "",

  startDate = "",
  endDate = "",

  overallStatus = "",
  tripStatus = "",
  paymentStatus = "",
  assignmentStatus = "",
  tripType = "",

  driverId = "",
  driverName = "",
  driverPhone = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/hourlyBookings?page=${page}&limit=${rowsPerPage}`;

    // ── Search ─────────────────────────────
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    // ── Date Filters ───────────────────────
    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    // ── Status Filters ─────────────────────
    if (overallStatus) {
      url += `&overallStatus=${overallStatus}`;
    }

    if (tripStatus) {
      url += `&tripStatus=${tripStatus}`;
    }

    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }

    if (assignmentStatus) {
      url += `&assignmentStatus=${assignmentStatus}`;
    }

    if (tripType) {
      url += `&tripType=${tripType}`;
    }

    // ── Driver Filters ──────────────────────
    if (driverId) {
      url += `&driverId=${driverId}`;
    }

    if (driverName) {
      url += `&driverName=${encodeURIComponent(driverName)}`;
    }

    if (driverPhone) {
      url += `&driverPhone=${driverPhone}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch hourly bookings");
    }

    return result;
  } catch (err) {
    console.error("Error fetching hourly bookings:", err);
    toast.error(err.message || "Failed to load hourly bookings");
    throw err;
  }
};


// ────────────────────────────────────────────────
// Get Single Hourly Booking By ID
// ────────────────────────────────────────────────
export const getHourlyBookingById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    if (!id) {
      throw new Error("Booking ID is required");
    }

    const url = `${BASE_URL}/api/admin/hourlyBookings/${id}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(
        result.message || "Failed to fetch booking details"
      );
    }

    return result;
  } catch (err) {
    console.error("Error fetching booking by id:", err);
    toast.error(err.message || "Failed to load booking details");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Assigned Hourly Drivers
// ────────────────────────────────────────────────
export const getAssignedHourlyDrivers = async ({
  page = 1,
  limit = 15,
  tripStatus = "",
  startDate = "",
  endDate = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/assignedHourlyDrivers?page=${page}&limit=${limit}`;

    if (tripStatus) {
      url += `&tripStatus=${tripStatus}`;
    }

    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch assigned drivers");
    }

    return result;
  } catch (err) {
    console.error("Error fetching assigned drivers:", err);
    toast.error(err.message || "Failed to load assigned drivers");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Unassigned Hourly Drivers
// ────────────────────────────────────────────────
export const getUnassignedHourlyDrivers = async ({
  page = 1,
  limit = 15,
  search = "",
  bookingId = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/unassignedHourlyDrivers?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (bookingId) {
      url += `&bookingId=${bookingId}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(
        result.message || "Failed to fetch unassigned drivers"
      );
    }

    return result;
  } catch (err) {
    console.error("Error fetching unassigned drivers:", err);
    toast.error(err.message || "Failed to load unassigned drivers");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Hourly Bookings By Driver (with filters + stats)
// ────────────────────────────────────────────────
export const getHourlyBookingsByDriver = async ({
  driverId,
  page = 1,
  limit = 15,

  overallStatus = "",
  tripStatus = "",
  paymentStatus = "",
  tripType = "",

  startDate = "",
  endDate = "",
  search = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    if (!driverId) {
      throw new Error("driverId is required");
    }

    let url = `${BASE_URL}/api/admin/hourlyDrivers/${driverId}?page=${page}&limit=${limit}`;

    // ── Filters ─────────────────────────────
    if (overallStatus) {
      url += `&overallStatus=${overallStatus}`;
    }

    if (tripStatus) {
      url += `&tripStatus=${tripStatus}`;
    }

    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }

    if (tripType) {
      url += `&tripType=${tripType}`;
    }

    // ── Date filters ─────────────────────────
    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    // ── Search ───────────────────────────────
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(
        result.message || "Failed to fetch driver bookings"
      );
    }

    return result;
  } catch (err) {
    console.error("Error fetching driver bookings:", err);
    toast.error(err.message || "Failed to load driver bookings");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Assign Driver to Hourly Booking
// POST /api/admin/hourlyBookings/:id/assign-driver
// Body: { driverId }
// ────────────────────────────────────────────────
export const assignHourlyDriver = async ({ bookingId, driverId }) => {
  const token = localStorage.getItem("token");

  try {
    if (!bookingId) throw new Error("bookingId is required");
    if (!driverId) throw new Error("driverId is required");

    const url = `${BASE_URL}/api/admin/hourlyBookings/${bookingId}/assign-driver`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ driverId }),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to assign driver");
    }

    toast.success(result.message || "Driver assigned successfully");
    return result;
  } catch (err) {
    console.error("Assign driver error:", err);
    toast.error(err.message || "Failed to assign driver");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Reassign Driver to Hourly Booking
// POST /api/admin/hourlyBookings/:id/reassign-driver
// Body: { driverId }
// ────────────────────────────────────────────────
export const reassignHourlyDriver = async ({ bookingId, driverId }) => {
  const token = localStorage.getItem("token");

  try {
    if (!bookingId) throw new Error("bookingId is required");
    if (!driverId) throw new Error("driverId is required");

    const url = `${BASE_URL}/api/admin/hourlyBookings/${bookingId}/reassign-driver`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ driverId }),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to reassign driver");
    }

    toast.success(result.message || "Driver reassigned successfully");
    return result;
  } catch (err) {
    console.error("Reassign driver error:", err);
    toast.error(err.message || "Failed to reassign driver");
    throw err;
  }
};