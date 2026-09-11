import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

// ────────────────────────────────────────────────
// Get Weekly Pricing
// ────────────────────────────────────────────────
export const getWeeklyPricing = async ({ page = 1, limit = 10, state, city } = {}) => {
  const token = localStorage.getItem('token');

  try {
    let url = `${BASE_URL}/api/admin/WeeklyPricing?page=${page}&limit=${limit}`;
    if (state) url += `&state=${state}`;
    if (city) url += `&city=${city}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to fetch Weekly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching Weekly pricing:', err);
    toast.error(err.message || 'Failed to load Weekly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Single Weekly Pricing by ID
// ────────────────────────────────────────────────
export const getWeeklyPricingById = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/WeeklyPricing/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to fetch Weekly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching Weekly pricing:', err);
    toast.error(err.message || 'Failed to load details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create Weekly Pricing
// ────────────────────────────────────────────────
export const createWeeklyPricing = async (data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/WeeklyPricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to create Weekly pricing');
    }

    toast.success('Weekly pricing created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating Weekly pricing:', err);
    toast.error(err.message || 'Failed to create Weekly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Weekly Pricing
// ────────────────────────────────────────────────
export const updateWeeklyPricing = async (id, data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/WeeklyPricing/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to update Weekly pricing');
    }

    toast.success('Weekly pricing updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating Weekly pricing:', err);
    toast.error(err.message || 'Failed to update Weekly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Toggle Weekly Pricing Status
// ────────────────────────────────────────────────

export const toggleWeeklyPricingStatus = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/WeeklyPricing/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// ────────────────────────────────────────────────
// Delete Weekly Pricing
// ────────────────────────────────────────────────
export const deleteWeeklyPricing = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/WeeklyPricing/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to delete Weekly pricing');
    }

    toast.success('Weekly pricing deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting Weekly pricing:', err);
    toast.error(err.message || 'Failed to delete Weekly pricing');
    throw err;
  }
};
