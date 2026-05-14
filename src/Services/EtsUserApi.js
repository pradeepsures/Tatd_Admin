import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getToken = () => localStorage.getItem("token");


// ✅ GET ALL ETS USERS
export const getAllEtsUsers = async ({
  page = 1,
  rowsPerPage = 10,
  search = "",
  isVerified = "",
  isDeleted = "",
  startDate = "",
  endDate = "",
} = {}) => {
  try {
    let url = `${BASE_URL}/api/admin/etsUser?page=${page}&limit=${rowsPerPage}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (isVerified !== "") {
      url += `&isVerified=${isVerified}`;
    }

    if (isDeleted !== "") {
      url += `&isDeleted=${isDeleted}`;
    }

       if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch ETS users");
    throw err;
  }
};



// ✅ CREATE ETS USER (with image upload)
export const createEtsUserApi = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUser`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData, // ✅ direct
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Failed to create user");
    throw err;
  }
};

// ✅ UPDATE ETS USER
export const updateEtsUserApi = async ({ id, data }) => {
  try {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const res = await fetch(`${BASE_URL}/api/admin/etsUser/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to update user");
    throw err;
  }
};



// ✅ GET SINGLE ETS USER
export const getEtsUserById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUser/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch user");
    throw err;
  }
};



// ✅ DELETE ETS USER
export const deleteEtsUserApi = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUser/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to delete user");
    throw err;
  }
};