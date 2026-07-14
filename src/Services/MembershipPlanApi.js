import axios from "axios";
const getToken = () => localStorage.getItem("token");

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";
const API_URL = `${BASE_URL}/api/admin/membership-plans`;

export const getMembershipPlans = async () => {
  try {
    const token = getToken();
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { status: false, message: "Server Error" };
  }
};

export const getMembershipPlanById = async (id) => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { status: false, message: "Server Error" };
  }
};

export const createMembershipPlan = async (formData) => {
  try {
    const token = getToken();
    const res = await axios.post(API_URL, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { status: false, message: "Server Error" };
  }
};

export const updateMembershipPlan = async (id, formData) => {
  try {
    const token = getToken();
    const res = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { status: false, message: "Server Error" };
  }
};

export const deleteMembershipPlan = async (id) => {
  try {
    const token = getToken();
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { status: false, message: "Server Error" };
  }
};
