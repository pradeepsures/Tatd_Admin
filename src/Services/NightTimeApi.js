// src/Services/CitiesApi.js

import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get All Night time
// ────────────────────────────────────────────────
export const getAllNightTimes = async ({
  page = 1,
  rowsPerPage = 10,
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/nightTimes?page=${page}&limit=${rowsPerPage}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch night times");
    }

    return result;
  } catch (err) {
    console.error("Error fetching night times:", err);
    toast.error(err.message || "Failed to load Night times");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get night time By ID
// ────────────────────────────────────────────────
export const getNightTimeById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/nightTimes/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch night times");
    }

    return result;
  } catch (err) {
    console.error("Error fetching night time:", err);
    toast.error(err.message || "Failed to load night time");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create night time
// ────────────────────────────────────────────────
export const createNightTimeApi = async (nightTimeData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/nightTimes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nightTimeData),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to create night time");
    }

    toast.success("Night time created successfully!");
    return result;
  } catch (err) {
    console.error("Error creating night time:", err);
    toast.error(err.message || "Failed to create night time");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update City (name + state only)
// ────────────────────────────────────────────────
export const updateNightTimeApi = async (id, nightTimeData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/nightTimes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nightTimeData),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to update night time");
    }

    toast.success("Night Time updated successfully!");
    return result;
  } catch (err) {
    console.error("Error updating night time:", err);
    toast.error(err.message || "Failed to update night time");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Delete City
// ────────────────────────────────────────────────
export const deleteNightTime = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/nightTimes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to delete night time");
    }

    toast.success("night time deleted successfully!");
    return result;
  } catch (err) {
    console.error("Error deleting night time:", err);
    toast.error(err.message || "Failed to delete night time");
    throw err;
  }
};