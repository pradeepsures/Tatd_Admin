// src/Services/CitiesApi.js

import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

// ────────────────────────────────────────────────
// Get All Cities (search + state + status support)
// ────────────────────────────────────────────────
export const getAllCities = async ({
  page = 1,
  rowsPerPage = 10,
  searchQuery = "",
  state = "",
  status = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/cities?page=${page}&limit=${rowsPerPage}`;

    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    if (state) {
      url += `&state=${state}`;
    }

    if (status !== "") {
      url += `&status=${status}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch cities");
    }

    return result;
  } catch (err) {
    console.error("Error fetching cities:", err);
    toast.error(err.message || "Failed to load cities");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get City By ID
// ────────────────────────────────────────────────
export const getCityById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cities/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to fetch city");
    }

    return result;
  } catch (err) {
    console.error("Error fetching city:", err);
    toast.error(err.message || "Failed to load city");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create City
// ────────────────────────────────────────────────
export const createCityApi = async (cityData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cityData),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to create city");
    }

    toast.success("City created successfully!");
    return result;
  } catch (err) {
    console.error("Error creating city:", err);
    toast.error(err.message || "Failed to create city");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update City (name + state only)
// ────────────────────────────────────────────────
export const updateCityApi = async (id, cityData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cities/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cityData),
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to update city");
    }

    toast.success("City updated successfully!");
    return result;
  } catch (err) {
    console.error("Error updating city:", err);
    toast.error(err.message || "Failed to update city");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Toggle City Status (IMPORTANT - YOUR BACKEND HAS THIS)
// ────────────────────────────────────────────────
export const toggleCityStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cities/${id}/toggle`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to toggle status");
    }

    toast.success(result.message || "Status updated");
    return result;
  } catch (err) {
    console.error("Error toggling city:", err);
    toast.error(err.message || "Failed to toggle status");
    throw err;
  }
};

// ────────────────────────────────────────────────
// Delete City
// ────────────────────────────────────────────────
export const deleteCity = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cities/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || "Failed to delete city");
    }

    toast.success("City deleted successfully!");
    return result;
  } catch (err) {
    console.error("Error deleting city:", err);
    toast.error(err.message || "Failed to delete city");
    throw err;
  }
};