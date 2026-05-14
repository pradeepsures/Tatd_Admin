import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// GET ALL COMPLAINTS
// Services/ComplaintApi.js
export const getAllComplaints = async ({
  page = 1,
  rowsPerPage = 15,
  searchQuery = "",
  issueCategory,
  ticketStatus,
  onModel,
  startDate,
  endDate,
}) => {
  const token = localStorage.getItem("token");

  // Build query string dynamically
  const params = new URLSearchParams({
    page,
    limit: rowsPerPage,
    search: searchQuery,
  });

  if (issueCategory) params.append("issueCategory", issueCategory);
  if (ticketStatus) params.append("ticketStatus", ticketStatus);
  if (onModel) params.append("onModel", onModel);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  try {
    const res = await fetch(`${BASE_URL}/api/admin/complaints?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch");
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch complaints");
    throw err;
  }
};
// export const getAllComplaints = async ({ page, rowsPerPage, searchQuery }) => {

//   const token = localStorage.getItem("token");

//   try {

//     const res = await fetch(
//       `${BASE_URL}/api/admin/complaints?page=${page}&limit=${rowsPerPage}&search=${searchQuery}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const result = await res.json();
//     return result;

//   } catch (err) {
//     toast.error(err.message || "Failed to fetch complaints");
//     throw err;
//   }

// };


// ✅ GET SINGLE COMPLAINT (BY ID)
export const getSingleComplaint = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/complaints/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch complaint");
    throw err;
  }

};


// ✅ UPDATE COMPLAINT (STATUS / EDIT)
export const updateComplaint = async (id, payload) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to update complaint");
    throw err;
  }

};