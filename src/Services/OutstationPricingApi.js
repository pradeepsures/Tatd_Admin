import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

// ────────────────────────────────────────────────
// Get Outstation Pricing
// ────────────────────────────────────────────────
export const getOutstationPricing = async ({ page = 1, limit = 10, state, city } = {}) => {
  const token = localStorage.getItem('token');

  try {
    let url = `${BASE_URL}/api/admin/OutstationPricing?page=${page}&limit=${limit}`;
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
      throw new Error(result.message || 'Failed to fetch Outstation pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching Outstation pricing:', err);
    toast.error(err.message || 'Failed to load Outstation pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Single Outstation Pricing by ID
// ────────────────────────────────────────────────
export const getOutstationPricingById = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/OutstationPricing/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to fetch Outstation pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching Outstation pricing:', err);
    toast.error(err.message || 'Failed to load details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create Outstation Pricing
// ────────────────────────────────────────────────
export const createOutstationPricing = async (data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/OutstationPricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to create Outstation pricing');
    }

    toast.success('Outstation pricing created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating Outstation pricing:', err);
    toast.error(err.message || 'Failed to create Outstation pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Outstation Pricing
// ────────────────────────────────────────────────
export const updateOutstationPricing = async (id, data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/OutstationPricing/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to update Outstation pricing');
    }

    toast.success('Outstation pricing updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating Outstation pricing:', err);
    toast.error(err.message || 'Failed to update Outstation pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Toggle Outstation Pricing Status
// ────────────────────────────────────────────────

export const toggleOutstationPricingStatus = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/OutstationPricing/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// ────────────────────────────────────────────────
// Delete Outstation Pricing
// ────────────────────────────────────────────────
export const deleteOutstationPricing = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/OutstationPricing/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to delete Outstation pricing');
    }

    toast.success('Outstation pricing deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting Outstation pricing:', err);
    toast.error(err.message || 'Failed to delete Outstation pricing');
    throw err;
  }
};
