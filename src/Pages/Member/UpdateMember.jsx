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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Breaker />

      <div className="card mx-auto w-full max-w-4xl p-5 sm:p-8">
        <div className="mb-7 flex items-center gap-3 border-b border-slate-200/70 pb-5">
          <div>
            <p className="section-label">Update record</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Update Member
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* USERNAME */}
          <div>
            <label className="field-label">Username</label>
            <input
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="field"
            />
            {apiError.userName && (
              <p className="field-error">{apiError.userName}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="field-label">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="field"
            />
            {apiError.email && (
              <p className="field-error">{apiError.email}</p>
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
            <label className="field-label">Role</label>
            <select
              value={formData.role}
              onChange={handleRoleChange}
              className="field"
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            {apiError.role && (
              <p className="field-error">{apiError.role}</p>
            )}
          </div>

          {/* IMAGE */}
          <div>
            <label className="field-label">Profile Image</label>

            <input
              type="file"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white/60 p-2 text-sm text-slate-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
            />

            {imagePreview && (
              <img
                src={imagePreview}
                className="mt-3 h-28 w-28 rounded-full object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
          </div>

          {/* BUTTON */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-6 sm:w-auto sm:min-w-[150px]"
            >
              {loading ? "Updating..." : "Update Member"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateMember;
