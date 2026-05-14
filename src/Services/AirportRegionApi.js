import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ CREATE AIRPORT REGION
export const createAirportRegion = async (payload) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/airportRegions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to create airport region");
    throw err;
  }

};

// GET ALL AIRPORT REGIONS
export const getAllAirportRegions = async ({
  page,
  rowsPerPage,
  searchQuery,
  isActive,
}) => {

  const token = localStorage.getItem("token");

  try {

    let url = `${BASE_URL}/api/admin/airportRegions?page=${page}&limit=${rowsPerPage}`;

    if (searchQuery) url += `&search=${searchQuery}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch airport regions");
    throw err;
  }
};

// ✅ GET SINGLE AIRPORT REGION (BY ID)
export const getSingleAirportRegion = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/airportRegions/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to fetch airport region");
    throw err;
  }

};


// ✅ UPDATE AIRPORT REGION
export const updateAirportRegion = async (id, payload) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/airportRegions/${id}`, {
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
    toast.error(err.message || "Failed to update airport region");
    throw err;
  }

};


// ✅ DELETE AIRPORT REGION
export const deleteAirportRegion = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(`${BASE_URL}/api/admin/airportRegions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to delete airport region");
    throw err;
  }

};

// TOGGLE STATUS
export const toggleAirportRegionStatus = async (id) => {

  const token = localStorage.getItem("token");

  try {

    const res = await fetch(
      `${BASE_URL}/api/admin/airportRegions/${id}/toggle-status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
    return result;

  } catch (err) {
    toast.error(err.message || "Failed to toggle status");
    throw err;
  }

};
