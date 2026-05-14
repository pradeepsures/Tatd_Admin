import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const createDriverApi = async (formData) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/drivers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — browser sets multipart/form-data automatically
      },
      body: formData,
    });

    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};


// GET ALL DRIVERS
// export const getAllDrivers = async ({ page, rowsPerPage, searchQuery }) => {

//   const token = localStorage.getItem("token");

//   try {

//     const res = await fetch(
//       `${BASE_URL}/api/admin/drivers?page=${page}&limit=${rowsPerPage}&search=${searchQuery}`,
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
//     toast.error(err.message || "Failed to fetch drivers");
//     throw err;
//   }

// };
export const getAllDrivers = async ({ page, rowsPerPage, searchQuery }) => {

  const token = localStorage.getItem("token");

  try {

    let url = `${BASE_URL}/api/admin/drivers?page=${page}&limit=${rowsPerPage}`;

    // ✅ only add search if exists
    if (searchQuery) {
      url += `&search=${searchQuery}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch drivers");
    throw err;
  }
};

// GET SINGLE DRIVER
export const getSingleDriver = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch driver");
    throw err;
  }

};

// UPDATE DRIVER
export const updateDriver = async (id, formData) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to update driver");
    throw err;
  }

};



// DELETE DRIVER
export const deleteDriver = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/drivers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to delete driver");
    throw err;
  }

};


// ✅ GET VEHICLE BOOKING DETAILS
export const getDriverBooking = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/getDriverBooking/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Booking details not found");
    }

    return result;

  } catch (err) {
    toast.error(err.message || "Error fetching booking details");
    throw err;
  }
};