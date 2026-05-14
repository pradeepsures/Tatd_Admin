import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL ASSIGNMENTS (WITH FILTERS)
export const getAllShuttleRouteShiftAssigns = async ({
  page = 1,
  rowsPerPage = 10,
  shuttleRoute = "",
  shuttleRouteShift = "",
  driver = "",
  vehicle = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/shuttleRouteShiftAssign?page=${page}&limit=${rowsPerPage}`;

    if (shuttleRoute) {
      url += `&shuttleRoute=${encodeURIComponent(shuttleRoute)}`;
    }

    if (shuttleRouteShift) {
      url += `&shuttleRouteShift=${encodeURIComponent(shuttleRouteShift)}`;
    }

    if (driver) {
      url += `&driver=${encodeURIComponent(driver)}`;
    }

    if (vehicle) {
      url += `&vehicle=${encodeURIComponent(vehicle)}`;
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
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch assignments");
    throw err;
  }
};

// ✅ CREATE ASSIGNMENT
export const createShuttleRouteShiftAssignApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttleRouteShiftAssign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to create assignment");
    throw err;
  }
};

// ✅ UPDATE ASSIGNMENT
export const updateShuttleRouteShiftAssignApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/shuttleRouteShiftAssign/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to update assignment");
    throw err;
  }
};

// ✅ GET SINGLE ASSIGNMENT
export const getShuttleRouteShiftAssignById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/shuttleRouteShiftAssign/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch assignment");
    throw err;
  }
};

// ✅ DELETE ASSIGNMENT
export const deleteShuttleRouteShiftAssignApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/shuttleRouteShiftAssign/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to delete assignment");
    throw err;
  }
};