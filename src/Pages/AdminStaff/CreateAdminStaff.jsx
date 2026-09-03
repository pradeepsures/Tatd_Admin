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
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="ml-5 mt-10 bg-white p-8 max-w-2xl rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Admin Staff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block ml-1 opacity-85 font-medium mb-1">Name:</label>
            <input
              className="w-full h-11 border rounded-xl px-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="userName"
              placeholder="Full Name"
              value={formData.userName}
              onChange={handleChange}
            />
            {apiError.userName && <p className="text-red-500 text-sm mt-1 ml-1">{apiError.userName}</p>}
          </div>

          <div>
            <label className="block ml-1 opacity-85 font-medium mb-1">Email:</label>
            <input
              className="w-full h-11 border rounded-xl px-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            {apiError.email && <p className="text-red-500 text-sm mt-1 ml-1">{apiError.email}</p>}
          </div>

          <div>
            <label className="block ml-1 opacity-85 font-medium mb-1">Password:</label>
            <input
              className="w-full h-11 border rounded-xl px-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {apiError.password && <p className="text-red-500 text-sm mt-1 ml-1">{apiError.password}</p>}
          </div>

          <div>
            <label className="block ml-1 opacity-85 font-medium mb-1">Assign Role:</label>
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
            {apiError.role && <p className="text-red-500 text-sm mt-1 ml-1">{apiError.role}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl shadow-md"
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
