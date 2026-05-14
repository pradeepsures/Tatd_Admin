import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL PUNCHES
export const getAllPunches = async ({
  page = 1,
  rowsPerPage = 10,
  driver = "",
  punchRegion = "",
  status = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/punches?page=${page}&limit=${rowsPerPage}`;

    // 🔍 Filters
    if (driver) url += `&driver=${driver}`;
    if (punchRegion) url += `&punchRegion=${punchRegion}`;
    if (status) url += `&status=${status}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

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
    toast.error(err.message || "Failed to fetch punches");
    throw err;
  }
};

// ✅ GET PUNCH BY ID
export const getPunchById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/punches/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch punch details");
    throw err;
  }
};

//punches today summary
export const getPunchesTodaySummary = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/punches/today-summary`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.message); 

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch today's punches summary");
    throw err;
  }
};

