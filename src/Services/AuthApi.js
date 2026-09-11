import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

export const getProfile = async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    return result.data.user; 
  } catch (err) {
    toast.error(err.message || 'Something went wrong!');
    throw new Error(err.message);
  }
};

export const updateProfile = async (formData) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    
    toast.success("Profile updated successfully!");
    return result.data;
  } catch (err) {
    toast.error(err.message || 'Failed to update profile!');
    throw new Error(err.message);
  }
};