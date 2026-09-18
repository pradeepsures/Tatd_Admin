import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

export const createDriverApi = async (formData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — browser sets multipart/form-data automatically
      },
      body: formData,
    });

    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};


// GET ALL DRIVERS
export const getAllDrivers = async ({
    page,
    limit,
    search,
    isVerified,
    isOnline,
    isAvailable,
    startDate,
    endDate
}) => {
    const token = localStorage.getItem("token");

    try {
        let url = `${BASE_URL}/api/admin/drivers?page=${page}&limit=${limit}`;

        if (search) url += `&search=${search}`;
        if (isVerified !== undefined) url += `&isVerified=${isVerified}`;
        if (isOnline !== undefined) url += `&isOnline=${isOnline}`;
        if (isAvailable !== undefined) url += `&isAvailable=${isAvailable}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return await res.json();

    } catch (err) {
        toast.error(err.message || "Failed to fetch drivers");
        throw err;
    }
};

// GET SINGLE DRIVER
export const getSingleDriver = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch driver");
    throw err;
  }

};

// UPDATE DRIVER
export const updateDriver = async (id, formData) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to update driver");
    throw err;
  }

};



// DELETE DRIVER
export const deleteDriver = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to delete driver");
    throw err;
  }

};


// ✅ GET VEHICLE BOOKING DETAILS
export const getDriverBooking = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/getDriverBooking/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Booking details not found");
    }

    return result;

  } catch (err) {
    toast.error(err.message || "Error fetching booking details");
    throw err;
  }
};

// ✅ GET DRIVER WALLET TRANSACTIONS
export const getDriverWalletTransactions = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}/wallet-transactions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch transactions");
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch transactions");
    throw err;
  }
};

// ✅ SETTLE DRIVER WALLET
export const settleDriverWallet = async (id, data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}/settle-wallet`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to settle wallet");
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to settle wallet");
    throw err;
  }
};

// --- DRIVER BANK DETAILS ---

export const getDriverBankDetailsList = async (page = 1, limit = 10, status = "") => {
  const token = localStorage.getItem("token");
  try {
    let url = `${BASE_URL}/api/admin/drivers/bank-details/list?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to fetch driver bank details list");
    throw err;
  }
};

export const getSingleDriverBankDetails = async (driverId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${driverId}/bank-details`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to fetch bank details");
    throw err;
  }
};

export const reverifyBankDetails = async (driverId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${driverId}/bank-details/reverify`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to reverify bank details");
    throw err;
  }
};

export const adminAddUpdateBankDetails = async (driverId, data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${driverId}/bank-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to update bank details");
    throw err;
  }
};

export const verifyPanOcrApi = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}/verify-pan-ocr`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to verify PAN via OCR");
    throw err;
  }
};

export const verifyDlOcrApi = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}/verify-dl-ocr`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to verify DL via OCR");
    throw err;
  }
};

export const verifyAadhaarOcrApi = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}/verify-aadhaar-ocr`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to verify Aadhaar via OCR");
    throw err;
  }
};