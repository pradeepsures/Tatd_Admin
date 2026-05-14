import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL PRICING
export const getAllPricing = async ({
  page = 1,
  rowsPerPage = 10,
  bookingType = "",
  isActive = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/pricing?page=${page}&limit=${rowsPerPage}`;

    if (bookingType) {
      url += `&bookingType=${bookingType}`;
    }

    if (isActive !== "") {
      url += `&isActive=${isActive}`;
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
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

// ✅ CREATE
export const createPricingApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/pricing`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

// ✅ UPDATE
export const updatePricingApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/pricing/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

// ✅ GET SINGLE
export const getPricingApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/pricing/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

// ✅ DELETE
export const deletePricingApi = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/pricing/${id}`, {
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
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};