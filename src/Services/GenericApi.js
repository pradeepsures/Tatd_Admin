import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

const getToken = () => localStorage.getItem('token');

export const GenericApi = {
  fetchList: async (endpoint, { page = 1, rowsPerPage = 10, searchQuery = '' } = {}) => {
    try {
      const token = getToken();
      const url = new URL(`${BASE_URL}${endpoint}`);
      if (searchQuery) url.searchParams.append('search', searchQuery);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', rowsPerPage);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error fetching data');
      return result;
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
      throw err;
    }
  },

  fetchDetails: async (endpoint, id) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}${endpoint}/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error fetching details');
      return result;
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
      throw err;
    }
  },

  createRecord: async (endpoint, data, isFormData = false) => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const body = isFormData ? data : JSON.stringify(data);

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      });
      const result = await res.json();
      return result;
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
      throw err;
    }
  },

  updateRecord: async (endpoint, id, data, isFormData = false) => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const body = isFormData ? data : JSON.stringify(data);

      const res = await fetch(`${BASE_URL}${endpoint}/${id}`, {
        method: 'PATCH',
        headers,
        body,
      });
      const result = await res.json();
      return result;
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
      throw err;
    }
  },

  deleteRecord: async (endpoint, id) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error deleting record');
      return result;
    } catch (err) {
      toast.error(err.message || 'Something went wrong!');
      throw err;
    }
  },
};
