import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminApi } from "../../Services/UserApi"; // 🔁 Replace with your actual API function
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    status: "",
    // profession: "",
    preferredLanguage: "en",
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(files[0]);
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = {};

    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.mobile) errors.mobile = "Mobile number is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (formData.status === "") errors.status = "Status is required";
    // if (!formData.profession) errors.profession = "Profession is required";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    const submissionData = new FormData();

    // ✅ Make sure values are present and converted to string
    submissionData.append("name", formData.name?.trim() || "");
    submissionData.append("email", formData.email?.trim() || "");
    submissionData.append("mobile", formData.mobile?.trim() || "");
    submissionData.append("dob", formData.dob || "");
    submissionData.append("gender", formData.gender || "");
    submissionData.append("status", formData.status.toString()); // 🔁 boolean to string
    // submissionData.append("profession", formData.profession?.trim() || "");
    submissionData.append("preferredLanguage", formData.preferredLanguage);

    if (formData.profileImage) {
      submissionData.append("profileImage", formData.profileImage);
    }

    // ✅ Optional: Log FormData to verify before sending
    for (let [key, value] of submissionData.entries()) {
      console.log(key, value);
    }

    try {
      const res = await createAdminApi(submissionData);
      if (res.status) {
        toast.success("User created successfully!");
        navigate(-1);
      } else {
        toast.error(res.message || "Failed to createUser");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card mx-auto w-full max-w-4xl p-5 sm:p-8">
        <div className="mb-7 flex items-center gap-3 border-b border-slate-200/70 pb-5">
          <div>
            <p className="section-label">New record</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Create User</h2>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            { label: "Name", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Mobile", name: "mobile", type: "tel" },
            { label: "Date of Birth", name: "dob", type: "date" },
            // { label: "Profession", name: "profession", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="field-label">{label}:</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="field"
                type={type}
                placeholder={label}
              />
              {apiError[name] && (
                <p className="field-error">{apiError[name]}</p>
              )}
            </div>
          ))}

          {/* Profile Image */}
          <div className="md:col-span-2">
            <label className="field-label">Profile Image:</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-28 rounded-xl object-cover ring-1 ring-black/5"
                />
              )}
              <label
                htmlFor="image-upload"
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white"
              >
                🖼️ Upload Image
              </label>
            </div>
            <input
              id="image-upload"
              className="hidden"
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {apiError.profileImage && (
              <p className="field-error">{apiError.profileImage}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="field-label">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="field"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {apiError.gender && (
              <p className="field-error">{apiError.gender}</p>
            )}
          </div>

          {/* Preferred Language */}
          <div>
            <label className="field-label">
              Preferred Language:
            </label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              className="field"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="pa">Punjabi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="gu">Gujarati</option>
              <option value="mr">Marathi</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="field-label">Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="field"
            >
              <option value="">Select Status</option>
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
            {apiError.status && (
              <p className="field-error">{apiError.status}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-6 sm:w-auto sm:min-w-[150px]"
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
