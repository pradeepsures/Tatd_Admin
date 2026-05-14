const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET Refund Policies
export const getAllRefundPolicy = async ({ page, rowsPerPage, searchQuery }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/refundPolicy?page=${page}&limit=${rowsPerPage}&search=${searchQuery}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

// ✅ UPDATE Refund Policy
export const updateRefundPolicyApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/refundPolicy/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return await res.json();
};