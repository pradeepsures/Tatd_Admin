import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { creatMemberApi } from "../../Services/MemberApi";
import { getAllRoleApi } from "../../Services/RoleApi";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import { Select } from "antd";

const { Option } = Select;

const CreateAdminStaff = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "",
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      setRoleLoading(true);
      try {
        const res = await getAllRoleApi({ page: 1, rowsPerPage: 100, searchQuery: "" });
        if (res?.status) {
          setRoles(res.data?.roles || []);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to load roles");
      } finally {
        setRoleLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    const errors = {};
    if (!formData.userName.trim()) errors.userName = "Name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.password.trim()) errors.password = "Password is required.";
    if (!formData.role) errors.role = "Role is required.";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      const res = await creatMemberApi(payload, false);
      if (res?.status) {
        toast.success("Admin staff created successfully!");
        navigate(-1);
      } else {
        toast.error(res?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error creating staff:", error);
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
          <h2 className="page-title">Add New Admin Staff</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          <div>
            <label className="field-label">Name:</label>
            <input
              className="field"
              type="text"
              name="userName"
              placeholder="Full Name"
              value={formData.userName}
              onChange={handleChange}
            />
            {apiError.userName && <p className="field-error">{apiError.userName}</p>}
          </div>

          <div>
            <label className="field-label">Email:</label>
            <input
              className="field"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            {apiError.email && <p className="field-error">{apiError.email}</p>}
          </div>

          <div>
            <label className="field-label">Password:</label>
            <input
              className="field"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {apiError.password && <p className="field-error">{apiError.password}</p>}
          </div>

          <div>
            <label className="field-label">Assign Role:</label>
            <Select
              showSearch
              placeholder="Select a Role"
              className="w-full h-11"
              value={formData.role || undefined}
              loading={roleLoading}
              onChange={handleRoleChange}
              filterOption={(input, option) =>
                (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
            {apiError.role && <p className="field-error">{apiError.role}</p>}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminStaff;
