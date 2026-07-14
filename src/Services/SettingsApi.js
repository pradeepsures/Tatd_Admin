import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

// --- APP CONFIG ---

export const getAppConfig = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/appConfig`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch App Config");
    throw err;
  }
};

export const updateAppConfig = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/appConfig`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to update App Config");
    throw err;
  }
};

// --- CANCELLATION REASONS ---

export const getCancellationReasons = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cancellationReasons`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch Cancellation Reasons");
    throw err;
  }
};

export const createCancellationReason = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cancellationReasons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to create Cancellation Reason");
    throw err;
  }
};

export const updateCancellationReason = async (id, data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cancellationReasons/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to update Cancellation Reason");
    throw err;
  }
};

export const deleteCancellationReason = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cancellationReasons/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to delete Cancellation Reason");
    throw err;
  }
};

// --- FEEDBACK TAGS ---

export const getFeedbackTags = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/feedbackTags`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch Feedback Tags");
    throw err;
  }
};

export const createFeedbackTag = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/feedbackTags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to create Feedback Tag");
    throw err;
  }
};

export const deleteFeedbackTag = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/feedbackTags/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to delete Feedback Tag");
    throw err;
  }
};

// --- OUTSTATION PRICING ---

export const getOutstationPricing = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/outstationPricing`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to fetch Outstation Pricing");
    throw err;
  }
};

export const updateOutstationPricing = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/outstationPricing`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (err) {
    toast.error(err.message || "Failed to update Outstation Pricing");
    throw err;
  }
};
