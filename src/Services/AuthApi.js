import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

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