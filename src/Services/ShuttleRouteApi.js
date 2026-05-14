import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL SHUTTLE ROUTES
export const getAllShuttleRoutes = async ({
  page = 1,
  rowsPerPage = 10,
  search = "",
  isActive = "",
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/shuttleRoute?page=${page}&limit=${rowsPerPage}`;

    // 🔍 SEARCH
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
    toast.error(err.message || "Failed to fetch shuttle routes");
    throw err;
  }
};

// ✅ CREATE ROUTE
export const createShuttleRouteApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttleRoute`, {
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
    toast.error(err.message || "Failed to create shuttle route");
    throw err;
  }
};

// ✅ UPDATE ROUTE
export const updateShuttleRouteApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttleRoute/${id}`, {
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
    toast.error(err.message || "Failed to update shuttle route");
    throw err;
  }
};

// ✅ GET SINGLE ROUTE
export const getShuttleRouteById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttleRoute/${id}`, {
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
    toast.error(err.message || "Failed to fetch shuttle route");
    throw err;
  }
};

// ✅ DELETE ROUTE
export const deleteShuttleRouteApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttleRoute/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to delete shuttle route");
    throw err;
  }
};

// ✅ TOGGLE STATUS (ONLY if you have this API)
export const toggleShuttleRouteStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/shuttleRouteToggle/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to toggle status");
    throw err;
  }
};