import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ GET ALL VEHICLES (with search & filters)
export const getAllVehicles = async ({
  page = 1,
  limit = 10,
  search = "",
  driverId = "",
  segmentId = "",
  brand = "",
  fuelType = "",
  isActive = "",
}) => {
  const token = localStorage.getItem("token");

  try {
    let url = `${BASE_URL}/api/admin/vehicle?page=${page}&limit=${limit}`;

    if (search)          url += `&search=${encodeURIComponent(search)}`;
    if (driverId)        url += `&driverId=${driverId}`;
    if (segmentId)       url += `&segmentId=${segmentId}`;
    if (brand)           url += `&brand=${encodeURIComponent(brand)}`;
    if (fuelType)        url += `&fuelType=${fuelType}`;
    if (isActive !== "") url += `&isActive=${isActive}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to fetch vehicles");
    }

    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong while fetching vehicles!");
    throw err;
  }
};

// ✅ GET SINGLE VEHICLE
export const getVehicleById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/vehicle/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Vehicle not found");
    return result;
  } catch (err) {
    toast.error(err.message || "Error fetching vehicle details");
    throw err;
  }
};

// ✅ CREATE VEHICLE
export const createVehicle = async (formData) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/vehicle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT set "Content-Type": "application/json"
        // let browser set it for FormData
      },
      body: formData, // directly pass FormData
    });

    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to create vehicle");
    throw err;
  }
};
// export const createVehicle = async (data) => {
//   const token = localStorage.getItem("token");

//   try {
//     const res = await fetch(`${BASE_URL}/api/admin/vehicle`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     return await res.json();
//   } catch (err) {
//     toast.error(err.message || "Failed to create vehicle");
//     throw err;
//   }
// };

// ✅ UPDATE VEHICLE

export const updateVehicle = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/vehicle/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        // 👇 DO NOT set "Content-Type: application/json"
        // Leave it out – fetch will autodetect multipart/form-data
      },
      body: data, // 👈 data is FormData, not JSON
    });

    return await res.json();
  } catch (err) {
    toast.error(err.message || "Failed to update vehicle");
    throw err;
  }
};

// ✅ DELETE VEHICLE
export const deleteVehicle = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/vehicle/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to delete vehicle");

    return result;
  } catch (err) {
    toast.error(err.message || "Error deleting vehicle");
    throw err;
  }
};

// ✅ GET VEHICLE BOOKING DETAILS
export const getVehicleBookingById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/getVechicleBooking/${id}`,
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

export const assignDriverToVehicle = async (vehicleId, driverId) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/assignVehicleDriver/${vehicleId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId }),
      }
    );

    return await res.json();
  } catch (err) {
    throw err;
  }
};