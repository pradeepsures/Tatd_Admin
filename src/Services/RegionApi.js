import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ────────────────────────────────────────────────
// Get All Regions (with pagination & optional search)
// ────────────────────────────────────────────────
export const getAllRegions = async ({ page = 1, rowsPerPage = 10, searchQuery = '' }) => {
  const token = localStorage.getItem('token');
  try {
    let url = `${BASE_URL}/api/admin/region?page=${page}&limit=${rowsPerPage}`;
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

    if (!res.ok || !result.status) {
      throw new Error(result.message || `Failed to fetch regions (HTTP ${res.status})`);
    }

    return result;
  } catch (err) {
    console.error('Error fetching regions:', err);
    toast.error(err.message || 'Failed to load regions');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Get Single Region by ID
// ────────────────────────────────────────────────
export const getRegionById = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/region/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || 'Failed to fetch region');
    }

    return result;
  } catch (err) {
    console.error('Error fetching region by ID:', err);
    toast.error(err.message || 'Failed to load region details');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Create New Region
// ────────────────────────────────────────────────
export const createRegionApi = async (regionData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/region`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(regionData), // { name, state, isActive }
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || 'Failed to create region');
    }

    toast.success('Region created successfully!');
    return result;
  } catch (err) {
    console.error('Error creating region:', err);
    toast.error(err.message || 'Failed to create region');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Update Region (PATCH)
// ────────────────────────────────────────────────
export const updateRegionApi = async (id, regionData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/region/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(regionData), // partial update: { name?, state?, isActive? }
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || 'Failed to update region');
    }

    toast.success('Region updated successfully!');
    return result;
  } catch (err) {
    console.error('Error updating region:', err);
    toast.error(err.message || 'Failed to update region');
    throw err;
  }
};

// ────────────────────────────────────────────────
// Delete Region
// ────────────────────────────────────────────────
export const deleteRegion = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/region/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    if (!res.ok || !result.status) {
      throw new Error(result.message || 'Failed to delete region');
    }

    toast.success('Region deleted successfully!');
    return result;
  } catch (err) {
    console.error('Error deleting region:', err);
    toast.error(err.message || 'Failed to delete region');
    throw err;
  }
};