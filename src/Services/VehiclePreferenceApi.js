import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ─────────────────────────────
// GET ALL
// ─────────────────────────────
export const getAllVehiclePreferences = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) => {
  const token = localStorage.getItem("token");

  let url = `${BASE_URL}/api/admin/vehiclePreferences?page=${page}&limit=${limit}`;

  if (search) url += `&search=${search}`;
  if (status !== "") url += `&status=${status}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return await res.json();
};

// ─────────────────────────────
// CREATE
// ─────────────────────────────
export const createVehiclePreferenceApi = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/vehiclePreferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await res.json();
};

// ─────────────────────────────
// UPDATE
// ─────────────────────────────
export const updateVehiclePreferenceApi = async (id, formData) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferences/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return await res.json();
};

// ─────────────────────────────
// DELETE
// ─────────────────────────────
export const deleteVehiclePreferenceApi = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferences/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return await res.json();
};

// ─────────────────────────────
// TOGGLE
// ─────────────────────────────
export const toggleVehiclePreferenceStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferences/${id}/toggle`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return await res.json();
};