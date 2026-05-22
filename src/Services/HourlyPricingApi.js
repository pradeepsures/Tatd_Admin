import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get Hourly Pricing
// ────────────────────────────────────────────────
export const getHourlyPricing = async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to fetch hourly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching hourly pricing:', err);
    toast.error(err.message || 'Failed to load hourly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Single Hourly Pricing by ID
// ────────────────────────────────────────────────
export const getHourlyPricingById = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to fetch hourly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching hourly pricing:', err);
    toast.error(err.message || 'Failed to load details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create Hourly Pricing
// ────────────────────────────────────────────────
export const createHourlyPricing = async (data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to create hourly pricing');
    }

    toast.success('Hourly pricing created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating hourly pricing:', err);
    toast.error(err.message || 'Failed to create hourly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Hourly Pricing
// ────────────────────────────────────────────────
export const updateHourlyPricing = async (id, data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to update hourly pricing');
    }

    toast.success('Hourly pricing updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating hourly pricing:', err);
    toast.error(err.message || 'Failed to update hourly pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Toggle Hourly Pricing Status
// ────────────────────────────────────────────────

export const toggleHourlyPricingStatus = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// ────────────────────────────────────────────────
// Delete Hourly Pricing
// ────────────────────────────────────────────────
export const deleteHourlyPricing = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== true) {
      throw new Error(result.message || 'Failed to delete hourly pricing');
    }

    toast.success('Hourly pricing deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting hourly pricing:', err);
    toast.error(err.message || 'Failed to delete hourly pricing');
    throw err;
  }
};