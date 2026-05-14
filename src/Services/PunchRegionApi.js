import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getToken = () => localStorage.getItem("token");

// ✅ GET ALL PUNCH REGIONS
export const getAllPunchRegions = async ({
  page = 1,
  rowsPerPage = 10,
  search = "",
  isActive = "",
  region = "",
} = {}) => {
  try {
    let url = `${BASE_URL}/api/admin/punchRegion?page=${page}&limit=${rowsPerPage}`;

    // 🔍 SEARCH
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // ✅ STATUS
    if (isActive !== "") {
      url += `&isActive=${isActive}`;
    }

    // 🌍 REGION FILTER
    if (region) {
      url += `&region=${region}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch punch regions");
    throw err;
  }
};

// ✅ CREATE PUNCH REGION
export const createPunchRegionApi = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/punchRegion`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to create punch region");
    throw err;
  }
};

// ✅ UPDATE PUNCH REGION
export const updatePunchRegionApi = async ({ id, data }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/punchRegion/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to update punch region");
    throw err;
  }
};

// ✅ GET SINGLE PUNCH REGION
export const getPunchRegionById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/punchRegion/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch punch region");
    throw err;
  }
};

// ✅ DELETE PUNCH REGION
export const deletePunchRegionApi = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/punchRegion/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to delete punch region");
    throw err;
  }
};


// ✅ ASSIGN PUNCH REGION TO DRIVER
export const assignPunchRegionApi = async ({ driverId, punchRegionId }) => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/assignPunchRegion/${driverId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ punchRegionId }),
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to assign punch region");
    throw err;
  }
};


// ✅ REMOVE PUNCH REGION FROM DRIVER
export const removePunchRegionApi = async (driverId) => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/removePunchRegion/${driverId}`,
      {
        method: "POST", 
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to remove punch region");
    throw err;
  }
};