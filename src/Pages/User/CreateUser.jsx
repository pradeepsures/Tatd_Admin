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
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          {[
            { label: "Name", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Mobile", name: "mobile", type: "tel" },
            { label: "Date of Birth", name: "dob", type: "date" },
            // { label: "Profession", name: "profession", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="ml-2 mt-4 font-normal block">{label}:</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                type={type}
                placeholder={label}
              />
              {apiError[name] && (
                <p className="text-red-500 text-sm ml-2">{apiError[name]}</p>
              )}
            </div>
          ))}

          {/* Profile Image */}
          <label className="ml-2 mt-4 font-normal block">Profile Image:</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
            />
          )}
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
          >
            🖼️ Upload Image
          </label>
          <input
            id="image-upload"
            className="hidden"
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleImageChange}
          />
          {apiError.profileImage && (
            <p className="text-red-500 text-sm ml-2">{apiError.profileImage}</p>
          )}

          {/* Gender */}
          <label className="ml-2 mt-4 font-normal block">Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {apiError.gender && (
            <p className="text-red-500 text-sm ml-2">{apiError.gender}</p>
          )}

          {/* Preferred Language */}
          <label className="ml-2 mt-4 font-normal block">
            Preferred Language:
          </label>
          <select
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
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

          {/* Status */}
          <label className="ml-2 mt-4 font-normal block">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="">Select Status</option>
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
          {apiError.status && (
            <p className="text-red-500 text-sm ml-2">{apiError.status}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 mt-6 rounded-2xl"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
