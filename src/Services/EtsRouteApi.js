import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL ROUTES
export const getAllEtsRoutes = async ({
  page = 1,
  rowsPerPage = 10,
  search = "",
  isActive = ""
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/etsRoute?page=${page}&limit=${rowsPerPage}`;

    // 🔍 SEARCH (by name)
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // ✅ STATUS
    if (isActive !== "") {
      url += `&isActive=${isActive}`;
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
    toast.error(err.message || "Failed to fetch routes");
    throw err;
  }
};

// ✅ CREATE ROUTE
export const createEtsRouteApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRoute`, {
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
export const updateEtsRouteApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRoute/${id}`, {
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
export const getEtsRouteById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRoute/${id}`, {
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
export const deleteEtsRouteApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRoute/${id}`, {
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

// ✅ TOGGLE ROUTE STATUS
export const toggleEtsRouteStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsRouteToggleStatus/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to toggle route status");
    throw err;
  }
};