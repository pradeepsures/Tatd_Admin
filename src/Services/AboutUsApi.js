
const BASE_URL = import.meta.env.VITE_BASE_URL;
import toast from 'react-hot-toast';

export const getAllAboutUs = async ({ page, rowsPerPage, searchQuery }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/aboutUs?page=${page}&limit=${rowsPerPage}&search=${searchQuery}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

export const updateAboutUsApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/aboutUs/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};
