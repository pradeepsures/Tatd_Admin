import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getToken = () => localStorage.getItem("token");

//get all EtsUserStopPages
export const getEtsUserStopPagesApi = async ({
  page = 1,
  limit = 15,
  user = "",
  route = "",
  isActive = "",
} = {}) => {

  const token = getToken();

  try {
    let url = `${BASE_URL}/api/admin/etsUserStoppage?page=${page}&limit=${limit}`;

    // ✅ add filters only if present
    if (user) url += `&user=${user}`;
    if (route) url += `&route=${route}`;
    if (isActive !== "") url += `&isActive=${isActive}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch user stop pages");
    throw err;
  }
};

// ✅ CREATE ROUTE
export const createEtsUserStopPagesApi = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUserStoppage`, {
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
    toast.error(err.message || "Failed to create route");
    throw err;
  }
};

//get EtsUserStopPages by id
export const getEtsUserStopPagesByIdApi = async (id) => {
  const token = getToken();   
  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUserStoppage/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch user stop page");
    throw err;
  } 
};

//update EtsUserStopPages by id 
export const updateEtsUserStopPagesApi = async (id, data) => {
  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUserStoppage/${id}`, {
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
  }catch (err) {
    toast.error(err.message || "Failed to update user stop page");
    throw err;
  } 
};

//delete EtsUserStopPages by id
export const deleteEtsUserStopPagesApi = async (id) => {
  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/api/admin/etsUserStoppage/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  }catch (err) {
    toast.error(err.message || "Failed to delete user stop page");
    throw err;
  } 
};