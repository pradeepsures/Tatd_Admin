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
  const navigate = useNavigate();
  const AVAILABLE_SECTIONS = [
    "Dashboard", "Driver", "Vehicle", "Booking", "User", "Membership", 
    "Pricing", "HourlyPricing", "WeeklyPricing", "MonthlyPricing", "OutstationPricing", "HourlyPackages",
    "Complaint", "Geography", "State", "City", "Region", "Settings", "Profile", "Role", "AdminStaff", "Config",
    "Feedback", "CancelReason", "Banner", "Segment", "CMS", "FAQ"
  ];

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
    <div className="page-shell">
      <Breaker />
      <div className="card p-5 sm:p-8">
        <div className="mb-6 border-b border-slate-200/70 pb-5">
          <p className="section-label">Access</p>
          <h1 className="page-title">Create Role</h1>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Role Name */}
          <label className="field-label">Role Name:</label>

          <input
            className="field"
            type="text"
            name="name"
            placeholder="Role Name"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && (
            <p className="field-error">{apiError.name}</p>
          )}

          {/* Permissions */}
          <label className="field-label mt-6">
            Permissions:
          </label>
          {formData.permissions.map((perm, index) => (
            <div key={index} className="mt-3 rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  className="w-full sm:w-80 h-10"
                  value={perm.sectionName || undefined}
                  onChange={(value) =>
                    handlePermissionChange(index, "sectionName", value)
                  }
                  filterOption={(input, option) =>
                    (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {AVAILABLE_SECTIONS.map((item) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
                {formData.permissions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePermissionField(index)}
                    className="btn-ghost !h-9 self-start text-rose-600 hover:!bg-rose-50 hover:!text-rose-700 sm:self-auto"
                  >
                    Remove
                  </button>
                )}
              </div>
              {apiError[`sectionName_${index}`] && (
                <p className="field-error">
                  {apiError[`sectionName_${index}`]}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white">
                  <input
                    type="checkbox"
                    checked={perm.isCreate}
                    onChange={() => handleCheckboxChange(index, "isCreate")}
                  />{" "}
                  Create
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white">
                  <input
                    type="checkbox"
                    checked={perm.isRead}
                    onChange={() => handleCheckboxChange(index, "isRead")}
                  />{" "}
                  Read
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white">
                  <input
                    type="checkbox"
                    checked={perm.isUpdate}
                    onChange={() => handleCheckboxChange(index, "isUpdate")}
                  />{" "}
                  Update
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white">
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
            className="btn-secondary mt-4 w-full sm:w-auto"
          >
            Add Permission
          </button>

          {/* Submit */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
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
