import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get All hourlyPricing (with pagination & search)
// ────────────────────────────────────────────────
export const getAllhourlyPricing = async ({
  page = 1,
  rowsPerPage = 10,
}) => {
  const token = localStorage.getItem('token');

  try {
    let url = `${BASE_URL}/api/admin/hourlyPricing?page=${page}&limit=${rowsPerPage}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== 'success') {
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

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to fetch hourly pricing');
    }

    return result;
  } catch (err) {
    console.error('Error fetching hourly Pricing:', err);
    toast.error(err.message || 'Failed to load details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create New Hourly Pricing
// ────────────────────────────────────────────────
export const createHourlyPricing= async (data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      // expected: { name, hours, includedKms, status }
    });

    const result = await res.json();

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to create pricing');
    }

    toast.success('Hourly pricing created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating hourly pricing:', err);
    toast.error(err.message || 'Failed to create pricing');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Hourly Pricing (PATCH)
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
      // partial update allowed
    });

    const result = await res.json();

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to update pricing');
    }

    toast.success('Hourly pricing updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating hourly pricing:', err);
    toast.error(err.message || 'Failed to update pricing');
    throw err;
  }
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

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to delete pricing');
    }

    toast.success('Hourly pricing deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting hourly pricing:', err);
    toast.error(err.message || 'Failed to delete pricing');
    throw err;
  }
};