import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllRoleApi } from "../../Services/RoleApi";
import { creatMemberApi } from "../../Services/MemberApi";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import { useNavigate } from "react-router-dom";

const CreateMember = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    mobile: "",
    profileImage: null,
    role: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [apiError, setApiError] = useState({});
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const navigate = useNavigate();
  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoleApi({
          page: 1,
          rowsPerPage: 100,
          searchQuery: "",
        });
        if (res.status && res.data?.roles) {
          setRoles(res.data.roles);
        } else {
          toast.error(res.message || "Failed to fetch roles");
        }
      } catch (error) {
        toast.error(error.message || "Error fetching roles");
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role select change
  const handleRoleChange = (e) => {
    setFormData((prev) => ({ ...prev, role: e.target.value }));
  };

  // Handle profile image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profileImage: file }));
    // Generate image preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Validate inputs
  const validate = () => {
    const errors = {};
    if (!formData.userName.trim()) errors.userName = "Username is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.password.trim()) errors.password = "Password is required.";
    if (!formData.mobile.trim()) errors.mobile = "Mobile number is required.";
    if (!formData.role) errors.role = "Please select a role.";
    return errors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError({});
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      return;
    }

    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("userName", formData.userName);
      dataToSend.append("email", formData.email);
      dataToSend.append("password", formData.password);
      dataToSend.append("mobile", formData.mobile);
      dataToSend.append("role", formData.role);
      if (formData.profileImage) {
        dataToSend.append("profileImage", formData.profileImage);
      }

      const res = await creatMemberApi(dataToSend, true);

      if (res.status) {
        toast.success("Member created successfully!");
        // Reset form and image preview
        setFormData({
          userName: "",
          email: "",
          password: "",
          mobile: "",
          profileImage: null,
          role: "",
        });
        setImagePreview(null);
        navigate(-1);
      } else {
        toast.error(res.message || "Failed to create member");
      }
    } catch (error) {
      toast.error(error.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-600">Loading roles...</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="min-h-screen flex  bg-gradient-to-br from-blue-50 to-gray-100 p-4">
        <div className="w-full max-w-9xl bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Create New Member
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter username"
              />
              {apiError.userName && (
                <p className="mt-1 text-sm text-red-600">{apiError.userName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter email"
              />
              {apiError.email && (
                <p className="mt-1 text-sm text-red-600">{apiError.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter password"
              />
              {apiError.password && (
                <p className="mt-1 text-sm text-red-600">{apiError.password}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter mobile number"
              />
              {apiError.mobile && (
                <p className="mt-1 text-sm text-red-600">{apiError.mobile}</p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {apiError.role && (
                <p className="mt-1 text-sm text-red-600">{apiError.role}</p>
              )}
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors opacity-0 absolute z-10"
                  id="profileImage"
                  accept="image/*"
                />
                <label
                  htmlFor="profileImage"
                  className="flex items-center w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-amber-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-600">
                    {formData.profileImage
                      ? formData.profileImage.name
                      : "Choose an image"}
                  </span>
                </label>
              </div>
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary  text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 px-5 mt-6 rounded-2xl"
            >
              {loading ? "Creating..." : "Create Member"}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMember;
