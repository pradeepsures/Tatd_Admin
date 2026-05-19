import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllRoleApi } from "../../Services/RoleApi";
import { updateMemberApi } from "../../Services/MemberApi";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import { useNavigate, useParams } from "react-router-dom";
import { getSingleMemberApi } from "../../Services/MemberApi";

const UpdateMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    profileImage: null,
    role: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError, setApiError] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // GET ROLES
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

  // GET SINGLE MEMBER
useEffect(() => {
  const fetchMember = async () => {
    try {
      const res = await getSingleMemberApi(id);

      if (res.status && res.data?.user) {
        const data = res.data.user;

        setFormData({
          userName: data.userName || "",
          email: data.email || "",
          password: "",
          mobile: data.mobile || "",
          profileImage: null,
          role: data.role?._id || "",
        });

        setImagePreview(
          data.profileImage
            ? data.profileImage.startsWith("http")
              ? data.profileImage
              : `${import.meta.env.VITE_BASE_URL}/${data.profileImage}`
            : null
        );
      } else {
        toast.error("Failed to load member data");
      }
    } catch (err) {
      toast.error("Error loading member");
    } finally {
      setLoadingData(false);
    }
  };

  fetchMember();
}, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profileImage: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.userName.trim()) errors.userName = "Username is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    return errors;
  };

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
      if (formData.password) {
        dataToSend.append("password", formData.password);
      }
      dataToSend.append("mobile", formData.mobile);
      dataToSend.append("role", formData.role);

      if (formData.profileImage) {
        dataToSend.append("profileImage", formData.profileImage);
      }

      const res = await updateMemberApi(dataToSend, true);

      if (res.status) {
        toast.success("Member updated successfully!");
        navigate(-1);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoles || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Breaker />
      </div>

      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-gray-100 p-4">
        <div className="w-full max-w-9xl bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-center mb-8">
            Update Member
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* USERNAME */}
            <div>
              <label>Username</label>
              <input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border rounded-lg"
              />
              {apiError.userName && (
                <p className="text-red-500">{apiError.userName}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border rounded-lg"
              />
              {apiError.email && (
                <p className="text-red-500">{apiError.email}</p>
              )}
            </div>

            {/* MOBILE */}
            {/* <div>
              <label>Mobile</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border rounded-lg"
              />
              {apiError.mobile && (
                <p className="text-red-500">{apiError.mobile}</p>
              )}
            </div> */}

            {/* ROLE */}
            <div>
              <label>Role</label>
              <select
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-2 py-1.5 border rounded-lg"
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {apiError.role && (
                <p className="text-red-500">{apiError.role}</p>
              )}
            </div>

            {/* IMAGE */}
            <div>
              <label>Profile Image</label>

              <input type="file" onChange={handleFileChange} />

              {imagePreview && (
                <img
                  src={imagePreview}
                  className="w-28 h-28 rounded-full mt-3 border"
                />
              )}
            </div>

            {/* BUTTON */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white py-3 px-5 rounded-2xl"
              >
                {loading ? "Updating..." : "Update Member"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateMember;