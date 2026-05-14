import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL ROUTES
export const getAllEtsRouteShiftAssign = async ({
  page = 1,
  rowsPerPage = 10,
  etsRoute = "",
  etsRouteShift = "",
  driver = "",
  vehicle = "",
  startDate = "",
  endDate = ""
} = {}) => {

  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/etsRouteShiftAssign?page=${page}&limit=${rowsPerPage}`;

    if (etsRoute) url += `&etsRoute=${encodeURIComponent(etsRoute)}`;
    if (etsRouteShift) url += `&etsRouteShift=${encodeURIComponent(etsRouteShift)}`;
    if (driver) url += `&driver=${encodeURIComponent(driver)}`;
    if (vehicle) url += `&vehicle=${encodeURIComponent(vehicle)}`;

    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

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

// ✅ CREATE ROUTE
export const createEtsRouteShiftAssignApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRouteShiftAssign`, {
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
    toast.error(err.message || "Failed to create route");
    throw err;
  }
};

// ✅ UPDATE ROUTE
export const updateEtsRouteShiftAssignApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRouteShiftAssign/${id}`, {
      method: "PATCH",
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
    toast.error(err.message || "Failed to update route");
    throw err;
  }
};

// ✅ GET SINGLE ROUTE
export const getEtsRouteShiftAssignById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRouteShiftAssign/${id}`, {
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
    toast.error(err.message || "Failed to fetch route");
    throw err;
  }
};

// ✅ DELETE ROUTE
export const deleteEtsRouteShiftAssignApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRouteShiftAssign/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to delete route");
    throw err;
  }
};
