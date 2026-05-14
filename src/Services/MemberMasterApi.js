const BASE_URL = import.meta.env.VITE_BASE_URL;
import toast from "react-hot-toast";

// ✅ GET ALL
export const getAllSectionName = async ({ page = 1, rowsPerPage = 10, searchQuery = "" }) => {
    const token = localStorage.getItem("token");

    const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        search: searchQuery || "",
    });

    const res = await fetch(
        `${BASE_URL}/api/admin/sectionName?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return await res.json();
};

// ✅ CREATE (POST)
export const createSectionNameApi = async (data) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/sectionName`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return await res.json();
};


// section name details
export const getSectionNameById = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/sectionName/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return await res.json();
};

// ✅ UPDATE (PATCH)
export const updateSectionNameApi = async ({ id, data }) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/sectionName/${id}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return await res.json();
};

// ✅ DELETE
export const deleteSectionNameApi = async (id) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/sectionName/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await res.json();
};