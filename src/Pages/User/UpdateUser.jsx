import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import { updateAdminApi, getSingleAdminApi } from "../../Services/UserApi"; // adjust path as needed

import { getImageUrl } from "../../utils/imageUtils";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const UpdateAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    // profession: "",
    preferredLanguage: "en",
    status: "",
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [selectedLang, setSelectedLang] = useState("en");

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const res = await getSingleAdminApi(id);
        if (res.status) {
          setFormData({
            name: res.data.name || "",
            email: res.data.email || "",
            mobile: res.data.mobile || "",
            dob: res.data.dob ? res.data.dob.split("T")[0] : "",
            gender: res.data.gender || "",
            // profession: res.data.profession || "",
            preferredLanguage: res.data.preferredLanguage || "en",
            status: res.data.status ? "true" : "false",
            profileImage: res.data.profileImage || null,
          });
          if (res.data.profileImage) {
            setImagePreview(res.data.profileImage);
          }
        } else {
          toast.error(res.message || "Failed to fetch User data");
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdminData();
    }
  }, [id]);

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
    setApiError({});

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "status") {
        dataToSend.append(key, formData.status === "true");
      } else if (formData[key] !== null && formData[key] !== "") {
        dataToSend.append(key, formData[key]);
      }
    });

      dataToSend.append("lang", selectedLang);

    try {
      const res = await updateAdminApi({ id, data: dataToSend });
      if (res.status) {
        toast.success("User updated successfully!");
        navigate(-1);
      } else {
        toast.error(res.message || "Failed to update admin");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card mx-auto w-full max-w-4xl p-5 sm:p-8">
        <div className="mb-7 flex flex-col gap-4 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="section-label">Update record</p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Update User</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Language:
            </label>

            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="field !h-9 w-32"
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
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="field-label">Name:</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="field"
              type="text"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="field-label">Email:</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="field"
              type="email"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="field-label">Mobile:</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="field"
              type="text"
              placeholder="Enter mobile number"
            />
          </div>

          <div>
            <label className="field-label">Date of Birth:</label>
            <input
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="field"
              type="date"
            />
          </div>

          {/* <label className="ml-2 font-normal block mt-4">Profession:</label>
          <input
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            placeholder="Enter profession"
          /> */}

          <div className="md:col-span-2">
            <label className="field-label">Profile Image:</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {imagePreview && (
                <img
                  src={getImageUrl(imagePreview)}
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
            </select>
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

          <div>
            <label className="field-label">Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="field"
            >
              <option value="">Select Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-6 sm:w-auto sm:min-w-[150px]"
            >
              {loading ? "Updating..." : "Update Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdmin;
