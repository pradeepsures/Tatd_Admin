import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL HOLIDAYS
export const getAllHolidays = async ({
  page = 1,
  rowsPerPage = 10,
  search = "",          
  isActive = "",
  region = "",
  startDate = "",       
  endDate = "",         
} = {}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/holidays?page=${page}&limit=${rowsPerPage}`;

    // ✅ SEARCH
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // ✅ STATUS
    if (isActive !== "") {
      url += `&isActive=${isActive}`;
    }

    // ✅ REGION
    if (region) {
      url += `&region=${region}`;
    }

    // ✅ DATE RANGE
    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
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
    toast.error(err.message || "Failed to fetch holidays");
    throw err;
  }
};

// ✅ CREATE HOLIDAY
export const createHolidayApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/holidays`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to create holiday");
    throw err;
  }
};

// ✅ UPDATE HOLIDAY
export const updateHolidayApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/holidays/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to update holiday");
    throw err;
  }
};

// ✅ GET SINGLE HOLIDAY
export const getHolidayById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/holidays/${id}`, {
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
    toast.error(err.message || "Failed to fetch holiday");
    throw err;
  }
};

// ✅ DELETE HOLIDAY
export const deleteHolidayApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/holidays/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to delete holiday");
    throw err;
  }
};

// ✅ TOGGLE HOLIDAY STATUS
export const toggleHolidayStatusApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/holidaysToggle/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to toggle status");
    throw err;
  }
};