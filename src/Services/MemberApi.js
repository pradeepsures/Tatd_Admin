
const BASE_URL = import.meta.env.VITE_BASE_URL;
import toast from "react-hot-toast";

export const getAllMember = async ({ page, rowsPerPage, search }) => {
  const token = localStorage.getItem("token");
  try {
    console.log(search, "search");
    const res = await fetch(
      `${BASE_URL}/api/admin/member?search=${search}&page=${page}&limit=${rowsPerPage}`,
      {
        method: "GET", // Change method to POST
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const result = await res.json();
    if (!res.status) throw new Error(result.message);
    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw new Error(err.message);
  }
};

export const getAllMemberExcell = async ({ searchQuery = '' } = {}) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    toast.error("Authentication token missing!");
    throw new Error("No token found");
  }

  try {
    const queryString = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';

    const res = await fetch(`${BASE_URL}/api/admin/memberExcell${queryString}`, {
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
      throw new Error(result.message || "Failed to fetch members for export");
    }

    // Important: Data is inside result.data.user
    const membersArray = result?.data?.user || [];

    if (!Array.isArray(membersArray)) {
      console.warn("Expected user array, received:", membersArray);
      toast.error("Invalid data format received");
      return { data: { user: [] } };
    }

    // Return in same structure so component can use result.data.user
    return {
      ...result,
      data: { user: membersArray } // ensure structure
    };

  } catch (err) {
    console.error("Error in getAllMemberExcell:", err);
    toast.error(err.message || "Failed to export members!");
    throw err;
  }
};
   export const creatMemberApi = async (data, isFormData = false) => {
    const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || 'Something went wrong!');
    throw err;
  }
};



  export const MemberDelete = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/member/${id}`, {
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
