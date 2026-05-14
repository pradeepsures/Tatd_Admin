import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL
export const getAllPlatformDependencies = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/platformDependencies`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await res.json();
  } catch (err) {
    toast.error("Failed to fetch platform dependencies");
    throw err;
  }
};

//create
export const createPlatformDependency = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/platformDependencies`,
      {
        method: "POST", // ✅ CREATE
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    return await res.json();
  } catch (err) {
    toast.error("Create failed");
    throw err;
  }
};

// ✅ GET BY ID
export const getPlatformDependencyById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/platformDependencies/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await res.json();
  } catch (err) {
    toast.error("Failed to fetch details");
    throw err;
  }
};

// ✅ UPDATE
export const updatePlatformDependency = async (id, data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/platformDependencies/${id}`,
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
  } catch (err) {
    toast.error("Update failed");
    throw err;
  }
};

// ✅ DELETE
export const deletePlatformDependency = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/platformDependencies/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await res.json();
  } catch (err) {
    toast.error("Delete failed");
    throw err;
  }
};