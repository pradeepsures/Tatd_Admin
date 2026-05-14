import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ SEND OTP
export const sendDeleteOtpApi = async (number, type) => {
  try {
    const res = await fetch(`${BASE_URL}/api/user/mobileCheck`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number,
        type, // "driver" or "user"
        countryCode: "+91",
      }),
    });

    const data = await res.json();
    console.log("SEND OTP:", data);
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to send OTP");
    return null;
  }
};

// ✅ VERIFY OTP
export const verifyDeleteOtpApi = async (number, otp, type) => {
  try {
    const res = await fetch(`${BASE_URL}/api/user/deleteVerifyOtp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number,
        otp,
        type,
      }),
    });

    const data = await res.json();
    console.log("VERIFY OTP:", data);
    return data;
  } catch (error) {
    console.error(error);
    toast.error("OTP verification failed");
    return null;
  }
};

// ✅ DELETE ACCOUNT
export const deleteAccountApi = async (id, type) => {
  try {
    const res = await fetch(`${BASE_URL}/api/user/deleteAccount/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
      }),
    });

    const data = await res.json();
    console.log("DELETE ACCOUNT:", data);
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Delete failed");
    return null;
  }
};