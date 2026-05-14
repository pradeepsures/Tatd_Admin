import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get All Hourly Packages (with pagination & search)
// ────────────────────────────────────────────────
export const getAllHourlyPackages = async ({
  page = 1,
  rowsPerPage = 10,
  searchQuery = '',
}) => {
  const token = localStorage.getItem('token');

  try {
    let url = `${BASE_URL}/api/admin/hourlyPackage?page=${page}&limit=${rowsPerPage}`;

    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to fetch hourly packages');
    }

    return result;
  } catch (err) {
    console.error('Error fetching hourly packages:', err);
    toast.error(err.message || 'Failed to load hourly packages');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Single Hourly Package by ID
// ────────────────────────────────────────────────
export const getHourlyPackageById = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPackage/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to fetch hourly package');
    }

    return result;
  } catch (err) {
    console.error('Error fetching hourly package:', err);
    toast.error(err.message || 'Failed to load details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create New Hourly Package
// ────────────────────────────────────────────────
export const createHourlyPackage = async (data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPackage`, {
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
      throw new Error(result.message || 'Failed to create package');
    }

    toast.success('Hourly package created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating hourly package:', err);
    toast.error(err.message || 'Failed to create package');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Hourly Package (PATCH)
// ────────────────────────────────────────────────
export const updateHourlyPackage = async (id, data) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPackage/${id}`, {
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
      throw new Error(result.message || 'Failed to update package');
    }

    toast.success('Hourly package updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating hourly package:', err);
    toast.error(err.message || 'Failed to update package');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Delete Hourly Package
// ────────────────────────────────────────────────
export const deleteHourlyPackage = async (id) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/hourlyPackage/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || result.status !== 'success') {
      throw new Error(result.message || 'Failed to delete package');
    }

    toast.success('Hourly package deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting hourly package:', err);
    toast.error(err.message || 'Failed to delete package');
    throw err;
  }
};