import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

//get all cancel requests
export const getCancelRequestsApi = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cancelRequests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

//approve cancel request
export const approveCancelRequestApi = async (id, adminNote) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/approveCancelRequest/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNote }),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to approve request");
    }

    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

//reject cancel request
export const rejectCancelRequestApi = async (id, adminNote) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/rejectCancelRequest/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNote }),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to approve request");
    }

    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong!");
    throw err;
  }
};

//reassign request to another driver
export const reassignCancelRequestApi = async (id, driverId) => {
  const token = localStorage.getItem("token");

    try {
        const res = await fetch( `${BASE_URL}/api/admin/reassignDriver/${id}`,
            {
                method: "POST", 
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",

                },
                body: JSON.stringify({ driverId }),
            }
        );
        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || "Failed to reassign request");
        }   
        return result;
    } catch (err) {
        toast.error(err.message || "Something went wrong!");
        throw err;
    }   
};

