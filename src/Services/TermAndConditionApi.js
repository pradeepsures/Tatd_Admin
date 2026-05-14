import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const updateTermApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/termCondition/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Important for JSON body
      },
      body: JSON.stringify(data), // Convert JS object to JSON string
    });

    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw new Error(err.message);
  }
};





export const getAllTerm = async ({ page, rowsPerPage, searchQuery, lang }) => {
  const token = localStorage.getItem('token');
    try {
      
      console.log(searchQuery, 'searchQuery')
      const res = await fetch(`${BASE_URL}/api/admin/termCondition?search=${searchQuery}&page=${page}&limit=${rowsPerPage}&lang=${lang}`, {
        method: 'GET', // Change method to POST
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
      throw new Error(err.message);
    }
  };0