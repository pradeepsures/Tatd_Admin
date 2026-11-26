import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateRole, getRoleById } from "../../Services/RoleApi";
import Breaker from "../../compoents/Breaker";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import { getAllSectionName } from "../../Services/MemberMasterApi";
import { Select } from "antd";
const { Option } = Select;

const UpdateRole = () => {
  const [formData, setFormData] = useState({
    name: "",
    permission: [],
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const AVAILABLE_SECTIONS = [
    "Dashboard", "Driver", "Vehicle", "Booking", "User", "Membership", 
    "Pricing", "HourlyPricing", "WeeklyPricing", "MonthlyPricing", "OutstationPricing", "HourlyPackages",
    "Complaint", "Geography", "State", "City", "Region", "Settings", "Profile", "Role", "AdminStaff", "Config",
    "Feedback", "CancelReason", "Banner", "Segment", "CMS", "FAQ"
  ];

  // useEffect(() => {
  //   if (id) {
  //     const fetchRole = async () => {
  //       setLoading(true);
  //       try {
  //         const res = await getRoleById(id);
  //         if (res.status) {
  //           const { name, permission } = res.data.role;
  //           setFormData({
  //             name,
  //             permission: permission.map((perm) => ({
  //               ...perm,
  //             })),
  //           });
  //           toast.success("Role fetched successfully!");
  //         } else {
  //           toast.error("Failed to fetch role data.");
  //         }
  //       } catch (err) {
  //         toast.error("Server error while fetching role");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchRole();
  //   }
  // }, [id]);

  useEffect(() => {
    if (id) {

      const fetchRole = async () => {
        setLoading(true);
        try {
          const res = await getRoleById(id);
          if (res.status) {
            const { name, permission } = res.data.role;

            setFormData({
              name,
              permission: permission.map((perm) => ({
                ...perm,
              })),
            });

            toast.success("Role fetched successfully!");
          } else {
            toast.error("Failed to fetch role data.");
          }
        } catch (err) {
          toast.error("Server error while fetching role");
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    }
  }, [id]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (index, field, value) => {
    const updatedPermissions = [...formData.permission];
    updatedPermissions[index][field] = value;
    setFormData({ ...formData, permission: updatedPermissions });
  };

  const handleCheckboxChange = (index, field) => {
    const updatedPermissions = [...formData.permission];
    updatedPermissions[index][field] = !updatedPermissions[index][field];
    setFormData({ ...formData, permission: updatedPermissions });
  };

  const handleAddPermission = () => {
    setFormData({
      ...formData,
      permission: [
        ...formData.permission,
        {
          sectionName: "",
          isSection: true,
          isCreate: false,
          isRead: false,
          isUpdate: false,
          isDelete: false,
        },
      ],
    });
  };

  const handleDeletePermission = (index) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to remove this role?"
    );
    if (isConfirmed) {
      const updatedPermissions = formData.permission.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, permission: updatedPermissions });
      console.log("Permission deleted");
    } else {
      console.log("User cancelled deletion");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Role name is required.";
    }

    formData.permission.forEach((perm, i) => {
      if (!perm.sectionName.trim()) {
        errors[`sectionName_${i}`] = `Section name is required for permission ${i + 1
          }`;
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
        permissions: formData.permission.map((perm) => ({
          sectionName: perm.sectionName,
          isSection: true,
          isCreate: perm.isCreate || false,
          isRead: perm.isRead || false,
          isUpdate: perm.isUpdate || false,
          isDelete: perm.isDelete || false,
        })),
      };

      const res = await updateRole({ id, data: payload });
      if (res.status) {
        toast.success("Role updated successfully!");
        navigate("/home/role");
      } else {
        toast.error(res.message || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the role.");
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
          <h1 className="page-title">Update Role</h1>
        </div>
        <form onSubmit={handleSubmit}>
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

          <label className="field-label mt-6">
            Permissions:
          </label>

          {formData.permission.map((perm, index) => (
            <div key={index} className="relative mt-3 rounded-xl border border-slate-200/70 bg-white/60 p-4 pr-12">
              <button
                type="button"
                onClick={() => handleDeletePermission(index)}
                className="btn-icon absolute right-2 top-2 font-bold hover:!bg-rose-50 hover:!text-rose-600"
                title="Delete this permission"
              >
                ✕
              </button>

              {/* <input
                className="w-3/4 h-10 mt-1 mb-1 border rounded-xl pl-4 border-gray-500"
                type="text"
                placeholder="Section Name"
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

          {/* Move Add Permission button here */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={handleAddPermission}
            >
              + Add Permission
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRole;
