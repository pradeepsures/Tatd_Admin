import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllPrivacyPolicy = async ({ page, rowsPerPage, searchQuery, lang }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/api/admin/privacyPolicy?page=${page}&limit=${rowsPerPage}&search=${searchQuery}&lang=${lang}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

//privacy policy view
export const getPrivacyPolicyById = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/privacyPolicy/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch privacy policy");
    }

    return await res.json();
  } catch (error) {
    toast.error(error.message || "Something went wrong");
    return null;
  }
};


//update privacy policy
export const updatePrivacyApi = async ({ id, data }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/privacyPolicy/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};



// ✅ USER PRIVACY POLICY
export const getUserPrivacyPolicy = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/privacyPolicy/69b39c3dc29c32db91ebc544`
    );

    const data = await res.json();
    console.log("USER POLICY:", data);

    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch user policy");
    return null;
  }
};

// ✅ DRIVER PRIVACY POLICY
export const getDriverPrivacyPolicy = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/privacyPolicy/69b39c47c29c32db91ebc547`
    );

    const data = await res.json();
    console.log("DRIVER POLICY:", data);

    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch driver policy");
    return null;
  }
};


// ✅ COMMON FUNCTION (AUTO ROUTE SWITCH)
export const getPrivacyPolicy = async (type) => {
  try {
    // 🔥 Decide API based on type
    const url =
      type === "driver"
        ? `${BASE_URL}/api/driver/privacyPolicy?type=driver`
        : `${BASE_URL}/api/user/privacyPolicy?type=user`;

    const res = await fetch(url);

    const data = await res.json();

    console.log(`${type.toUpperCase()} POLICY:`, data);

    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch privacy policy");
    return null;
  }
};