import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL FUEL LOGS
export const getAllFuelLogs = async ({
  page = 1,
  rowsPerPage = 10,
  driver = "",
  vehicle = "",
  carNumber = "",
  fuelType = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/fuelLogs?page=${page}&limit=${rowsPerPage}`;

    // 🔍 Filters
    if (driver) url += `&driver=${driver}`;
    if (vehicle) url += `&vehicle=${vehicle}`;
    if (carNumber)
      url += `&carNumber=${encodeURIComponent(carNumber)}`;
    if (fuelType) url += `&fuelType=${fuelType}`;
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
    toast.error(err.message || "Failed to fetch fuel logs");
    throw err;
  }
};

// ✅ GET FUEL LOG BY ID
export const getFuelLogById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/fuelLogs/${id}`,
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
    toast.error(err.message || "Failed to fetch fuel log");
    throw err;
  }
};