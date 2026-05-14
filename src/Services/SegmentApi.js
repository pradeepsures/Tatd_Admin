import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllSegment = async ({ page, rowsPerPage }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/segment?page=${page}&limit=${rowsPerPage}`,
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
    toast.error(err.message || "Something went wrong!");
    throw new Error(err.message);
  }
};


  export const createSegmentApi = async (data) => {
    console.log(data, ' data for send in the api');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL}/api/admin/segment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // 'Content-Type': 'application/json'
        },
        body: data // Send the data as JSON
      });
      const result = await res.json();

  
      return result;
     
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
      throw new Error(err.message);
    }
  };

  
export const updateSegmentApi = async ({ id, data }) => {
  const token = localStorage.getItem('token');
  console.log(data, 'data');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/segment/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: data
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || 'Something went wrong!');
    throw new Error(err.message);
  }
};
export const getSegmentApi = async (id) => {

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/segment/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || 'Something went wrong!');
    throw new Error(err.message);
  }
};

export const SegmentDelete = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/segment/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw new Error(err.message);
  }
};