import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

// ────────────────────────────────────────────────
// Get Monthly Pricing
// ────────────────────────────────────────────────
export const getMonthlyPricing = async ({ page = 1, limit = 10, state, city } = {}) => {
  const token = localStorage.getItem('token');

  try {
    let url = `${BASE_URL}/api/admin/MonthlyPricing?page=${page}&limit=${limit}`;
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
      throw new Error(result.message || 'Failed to fetch Monthly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching Monthly pricing:', err);
    toast.error(err.message || 'Failed to load Monthly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Single Monthly Pricing by ID
// ────────────────────────────────────────────────
export const getMonthlyPricingById = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/MonthlyPricing/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to fetch Monthly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching Monthly pricing:', err);
    toast.error(err.message || 'Failed to load details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create Monthly Pricing
// ────────────────────────────────────────────────
export const createMonthlyPricing = async (data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/MonthlyPricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to create Monthly pricing');
    }

    toast.success('Monthly pricing created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating Monthly pricing:', err);
    toast.error(err.message || 'Failed to create Monthly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Monthly Pricing
// ────────────────────────────────────────────────
export const updateMonthlyPricing = async (id, data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/MonthlyPricing/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to update Monthly pricing');
    }

    toast.success('Monthly pricing updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating Monthly pricing:', err);
    toast.error(err.message || 'Failed to update Monthly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Toggle Monthly Pricing Status
// ────────────────────────────────────────────────

export const toggleMonthlyPricingStatus = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/MonthlyPricing/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// ────────────────────────────────────────────────
// Delete Monthly Pricing
// ────────────────────────────────────────────────
export const deleteMonthlyPricing = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/MonthlyPricing/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to delete Monthly pricing');
    }

    toast.success('Monthly pricing deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting Monthly pricing:', err);
    toast.error(err.message || 'Failed to delete Monthly pricing');
    throw err;
  }
};
