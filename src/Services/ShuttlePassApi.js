import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL SHUTTLE PASSES
export const getAllShuttlePasses = async ({
  page = 1,
  rowsPerPage = 10,
  search = "",
  isActive = "",
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/shuttlePass?page=${page}&limit=${rowsPerPage}`;

    // 🔍 SEARCH
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // ✅ STATUS FILTER
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
    toast.error(err.message || "Failed to fetch shuttle passes");
    throw err;
  }
};

// ✅ CREATE PASS
export const createShuttlePassApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttlePass`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data, 
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to create shuttle pass");
    throw err;
  }
};
// ✅ UPDATE PASS
export const updateShuttlePassApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttlePass/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to update shuttle pass");
    throw err;
  }
};

// ✅ GET SINGLE PASS
export const getShuttlePassById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttlePass/${id}`, {
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
    toast.error(err.message || "Failed to fetch shuttle pass");
    throw err;
  }
};

// ✅ DELETE PASS
export const deleteShuttlePassApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/shuttlePass/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to delete shuttle pass");
    throw err;
  }
};

// ✅ TOGGLE STATUS (if API exists)
export const toggleShuttlePassStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/shuttlePass/${id}/toggle-status`,
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