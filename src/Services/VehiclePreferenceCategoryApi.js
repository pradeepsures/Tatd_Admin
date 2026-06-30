const BASE_URL = import.meta.env.VITE_BASE_URL;

// ─────────────────────────────
// GET ALL VEHICLE PREFERENCE CATEGORIES
// ─────────────────────────────
export const getAllVehiclePreferenceCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  vehiclePreference = "",
}) => {
  const token = localStorage.getItem("token");

  let url = `${BASE_URL}/api/admin/vehiclePreferenceCategories?page=${page}&limit=${limit}`;

  if (search) {
    url += `&search=${search}`;
  }

  if (status !== "") {
    url += `&status=${status}`;
  }

  if (vehiclePreference) {
    url += `&vehiclePreference=${vehiclePreference}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// ─────────────────────────────
// CREATE
// ─────────────────────────────
export const createVehiclePreferenceCategoryApi = async (data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferenceCategories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return await res.json();
};

// ─────────────────────────────
// UPDATE
// ─────────────────────────────
export const updateVehiclePreferenceCategoryApi = async (id, data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferenceCategories/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return await res.json();
};

// ─────────────────────────────
// DELETE
// ─────────────────────────────
export const deleteVehiclePreferenceCategoryApi = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferenceCategories/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

// ─────────────────────────────
// TOGGLE STATUS
// ─────────────────────────────
export const toggleVehiclePreferenceCategoryStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/vehiclePreferenceCategories/${id}/toggle`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};