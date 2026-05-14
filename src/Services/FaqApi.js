import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;



export const getAllFaqs = async ({ page, rowsPerPage, searchQuery, lang }) => {
  const token = localStorage.getItem('token');
  try {
    console.log('Token:', token);
    console.log('searchQuery:', searchQuery);
    const res = await fetch(
      `${BASE_URL}/api/admin/faq?page=${page}&limit=${rowsPerPage}${searchQuery ? `&search=${searchQuery}` : ''}${lang ? `&lang=${lang}` : ''}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          // Remove Content-Type for GET
        },
      }
    );
    const result = await res.json();
    console.log('getAllAdmins API response:', result);
    if (!res.ok) {
      throw new Error(result.message || `HTTP error: ${res.status}`);
    }
    if (!result.status) {
      throw new Error(result.message || 'Failed to fetch users.');
    }
    return result;
  } catch (err) {
    console.error('Error in getAllAdmins:', err);
    throw err; // Let component handle toasts
  }
};
  export const deleteFaq  = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/faq/${id}`, {
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


export const createFaqApi = async (faqData) => {
  const token = localStorage.getItem("token"); // agar auth hai
  try {
    const res = await fetch(`${BASE_URL}/api/admin/faq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // agar auth na ho to isko hata dena
      },
      body: JSON.stringify(faqData),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error creating FAQ:", error);
    throw error;
  }
};

export const updateFAQApi = async (id, faqData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/faq/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(faqData),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw error;
  }
};
export const getFAQByIdApi  = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/faq/${id}`, {
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
