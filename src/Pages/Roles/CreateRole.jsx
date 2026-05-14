import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker"; // Ensure correct path
import { createRole } from "../../Services/RoleApi"; // Your API service
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader"; // Ensure correct path
import { getAllSectionName } from "../../Services/MemberMasterApi";

import { Select } from "antd";
const { Option } = Select;

const CreateRole = () => {
  const [formData, setFormData] = useState({
    name: "",
    permissions: [
      {
        sectionName: "",
        isCreate: false,
        isRead: false,
        isUpdate: false,
        isDelete: false,
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [apiMessage, setApiMessage] = useState("");
  const [sectionOptions, setSectionOptions] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSections = async (search = "") => {
    try {
      setSectionLoading(true);

      const res = await getAllSectionName({
        page: 1,
        rowsPerPage: 20,
        searchQuery: search,
      });

      if (res?.status) {
        setSectionOptions(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching sections", err);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePermissionChange = (index, field, value) => {
    const updatedPermissions = [...formData.permissions];
    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [field]: value,
    };
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleCheckboxChange = (index, field) => {
    const updatedPermissions = [...formData.permissions];
    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [field]: !updatedPermissions[index][field],
    };
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const addPermissionField = () => {
    setFormData({
      ...formData,
      permissions: [
        ...formData.permissions,
        {
          sectionName: "",
          isCreate: false,
          isRead: false,
          isUpdate: false,
          isDelete: false,
        },
      ],
    });
  };

  const removePermissionField = (index) => {
    const updatedPermissions = formData.permissions.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiMessage("");
    setApiError({});

    const errors = {};
    if (!formData.name.trim()) errors.name = "Role name is required.";
    formData.permissions.forEach((perm, index) => {
      if (!perm.sectionName.trim()) {
        errors[
          `sectionName_${index}`
        ] = `Section name is required for permission ${index + 1}.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        permissions: formData.permissions.map((perm) => ({
          sectionName: perm.sectionName,
          isSection: true,
          isCreate: perm.isCreate,
          isRead: perm.isRead,
          isUpdate: perm.isUpdate,
          isDelete: perm.isDelete,
        })),
      };

      const res = await createRole(payload);
      if (res?.status) {
        toast.success("Role created successfully!");
        navigate(-1);
      } else {
        toast.error(res?.message || "Something went wrong!");
        setApiMessage(res?.message || "Error creating role.");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error(error?.message || "Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="ml-5 mt-10 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Role Name */}
          <label className="ml-2 opacity-85 font-normal">Role Name:</label>

          <input
            className="w-full h-10 mt-1 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            name="name"
            placeholder="Role Name"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && (
            <p className="text-red-500 text-sm ml-2 mb-2">{apiError.name}</p>
          )}

          {/* Permissions */}
          <label className="ml-2 opacity-85 font-normal mt-4 block">
            Permissions:
          </label>
          {formData.permissions.map((perm, index) => (
            <div key={index} className="border p-4 mt-2 rounded-lg">
              <div className="flex items-center justify-between">
                {/* <input
                  className="w-3/4 h-10 mt-1 mb-1 border rounded-xl pl-4 border-gray-500"
                  type="text"
                  placeholder="Section Name (e.g., Banner, Blog)"
                  value={perm.sectionName}
                  onChange={(e) =>
                    handlePermissionChange(index, "sectionName", e.target.value)
                  }
                /> */}
                <Select
                  showSearch
                  placeholder="Select Section"
                  className="w-3/4 h-10"
                  value={perm.sectionName || undefined}
                  loading={sectionLoading}
                  onSearch={(value) => fetchSections(value)}
                  onChange={(value) =>
                    handlePermissionChange(index, "sectionName", value)
                  }
                  filterOption={false}
                >
                  {sectionOptions.map((item) => (
                    <Option key={item._id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
                {formData.permissions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePermissionField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              {apiError[`sectionName_${index}`] && (
                <p className="text-red-500 text-sm ml-2 mb-2">
                  {apiError[`sectionName_${index}`]}
                </p>
              )}
              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isCreate}
                    onChange={() => handleCheckboxChange(index, "isCreate")}
                  />{" "}
                  Create
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isRead}
                    onChange={() => handleCheckboxChange(index, "isRead")}
                  />{" "}
                  Read
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isUpdate}
                    onChange={() => handleCheckboxChange(index, "isUpdate")}
                  />{" "}
                  Update
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isDelete}
                    onChange={() => handleCheckboxChange(index, "isDelete")}
                  />{" "}
                  Delete
                </label>
              </div>
            </div>
          ))}

          {/* Add Permission Button */}
          <button
            type="button"
            onClick={addPermissionField}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600"
          >
            Add Permission
          </button>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 bg-primary text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 mt-6 rounded-2xl"
            >
              {loading ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRole;
