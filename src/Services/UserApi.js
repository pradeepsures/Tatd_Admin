import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllAdmins = async ({
  page = 1,
  rowsPerPage = 10,
  searchQuery = '',
  startDate = null,
  endDate = null,
  zeroBalance = false,
  notZeroBalance = false,
  lang = 'en',
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found. Please login again.");
  }

  try {
    // Build query string
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", rowsPerPage);   // most backends use "limit" instead of "rowsPerPage"
    params.append("lang", lang);

    if (searchQuery?.trim()) {
      params.append("search", searchQuery.trim());
    }

    if (startDate) {
      params.append("startDate", startDate);
    }

    if (endDate) {
      params.append("endDate", endDate);
    }

    // Add the new balance filters (send only if true)
    if (zeroBalance === true) {
      params.append("zeroBalance", "true");
    }

    if (notZeroBalance === true) {
      params.append("notZeroBalance", "true");
    }

    const queryString = params.toString();
    const url = `${BASE_URL}/api/admin/user${queryString ? `?${queryString}` : ''}`;

    console.group("getAllAdmins API Call");
    console.log("URL:", url);
    console.log("Token:", token?.substring(0, 15) + "...");
    console.log("Payload params:", {
      page,
      limit: rowsPerPage,
      search: searchQuery,
      startDate,
      endDate,
      zeroBalance,
      notZeroBalance,
      lang,
    });
    console.groupEnd();

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await res.json();

    console.log("API Response:", result);

    if (!res.ok) {
      const errorMsg = result.message || `Server responded with status ${res.status}`;
      throw new Error(errorMsg);
    }

    if (!result.status) {
      throw new Error(result.message || "API returned unsuccessful status");
    }

    // Expected successful structure (adjust keys if your backend uses different names)
    return {
      status: true,
      data: result.data || result.users || [],
      totalPage: result.totalPages || result.totalPage || 0,
      totalResult: result.total || result.totalRecords || result.count || 0,
      // ... add any other fields your component expects
    };

  } catch (err) {
    console.error("getAllAdmins failed:", err);

    // Optional: show toast here (but most people prefer to handle it in component)
    // toast.error(err.message || "Failed to load admins");

    throw err; // Let the calling component catch & show toast/loading state
  }
};

export const getAllUserExcell = async ({ searchQuery = '', startDate = '', endDate = '' } = {}) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    toast.error("Authentication token missing!");
    throw new Error("No token found");
  }

  try {
    let queryString = '';
    const params = [];
    
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    
    if (params.length > 0) {
      queryString = `?${params.join('&')}`;
    }

    const res = await fetch(`${BASE_URL}/api/admin/userExcell${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const result = await res.json();

    // Check if status is true
    if (!result.status) {
      throw new Error(result.message || "Failed to fetch users for export");
    }

    // Important: Data is inside result.data
    const usersArray = result?.data || [];

    if (!Array.isArray(usersArray)) {
      console.warn("Expected user array, received:", usersArray);
      toast.error("Invalid data format received");
      return [];
    }

    // Return clean array of users
    return usersArray;

  } catch (err) {
    console.error("Error in getAllUserExcell:", err);
    toast.error(err.message || "Failed to export users!");
    throw err;
  }
};

  export const deleteAdmin = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/user/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await res.json();
    if (!res.status) throw new Error(result.message);
    return result;
  } catch (err) {
    toast.error(err.message || 'Something went wrong!');
    throw new Error(err.message || 'Something went wrong!');
  }
};
export const createAdminApi = async (formData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Only auth header
        // Don't set Content-Type manually!
      },
      body: formData // ✅ send FormData directly
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || 'Something went wrong!');
    throw new Error(err.message);
  }
};

// // Services/AdminApi.js
// import toast from 'react-hot-toast';




export const updateAdminApi = async ({ id, data, lang }) => {
  const token = localStorage.getItem('token');
  if (!id) throw new Error("Missing ID in updateAdminApi");

  const res = await fetch(`${BASE_URL}/api/admin/user/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`, // ✅ DO NOT manually set Content-Type
    },
    body: data, // ✅ Send FormData directly
  });

  return res.json();
};


export const getSingleAdminApi = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (err) {
    // Don't use toast here, let caller handle errors
    return { status: false, message: 'Failed to fetch admin' };
  }
};

export const UserWalletApi = async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ JSON header required
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload), // ✅ Send plain JSON
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw new Error(err.message);
  }
};


//veryfy-otp
export const verifyDeleteOtpApi = async ({ mobile, otp }) => {
  const res = await fetch(`${BASE_URL}/api/verifyOtp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mobile, otp }),
  });

  return res.json();
};


// Send OTP
export const sendDeleteAccountOtpApi = async (mobile) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/deleteAccount/sendOtp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile, userType: "user" }),
    });
    return await response.json();
  } catch (error) {
    throw error.response?.data || { message: "Failed to send OTP" };
  }
};

// Verify OTP & Delete Account
export const verifyDeleteAccountOtpApi = async (mobile, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/deleteAccount/verifyOtp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile, otp,  userType: "user",  }),
    });
    return await response.json();
  } catch (error) {
    throw error.response?.data || { message: "OTP verification failed" };
  }
};