import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get All States
// ────────────────────────────────────────────────
export const getAllStates = async ({
  page = 1,
  rowsPerPage = 10,
  searchQuery = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/states?page=${page}&limit=${rowsPerPage}`;

    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch states");
    }

    return result;
  } catch (err) {
    console.error("Error fetching states:", err);
    toast.error(err.message || "Failed to load states");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get State By ID
// ────────────────────────────────────────────────
export const getStateById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/states/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch state");
    }

    return result;
  } catch (err) {
    console.error("Error fetching state:", err);
    toast.error(err.message || "Failed to load state");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create State
// ────────────────────────────────────────────────
export const createStateApi = async (stateData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/states`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stateData),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to create state");
    }

    toast.success("State created successfully!");
    return result;
  } catch (err) {
    console.error("Error creating state:", err);
    toast.error(err.message || "Failed to create state");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update State
// ────────────────────────────────────────────────
export const updateStateApi = async (id, stateData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/states/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stateData),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to update state");
    }

    toast.success("State updated successfully!");
    return result;
  } catch (err) {
    console.error("Error updating state:", err);
    toast.error(err.message || "Failed to update state");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Delete State
// ────────────────────────────────────────────────
export const deleteState = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/states/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to delete state");
    }

    toast.success("State deleted successfully!");
    return result;
  } catch (err) {
    console.error("Error deleting state:", err);
    toast.error(err.message || "Failed to delete state");
    throw err;
  }
};