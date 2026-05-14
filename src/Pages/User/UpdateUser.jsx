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
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">


        <div className="mb-4 flex justify-end items-center gap-2">
          <label className="text-xl font-medium text-gray-600">
            Language:
          </label>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-24 h-8 text-sm border rounded-md px-2 border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        <form onSubmit={handleSubmit}>
          <label className="ml-2 font-normal block">Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            placeholder="Enter name"
          />

          <label className="ml-2 font-normal block mt-4">Email:</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="email"
            placeholder="Enter email"
          />

          <label className="ml-2 font-normal block mt-4">Mobile:</label>
          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            placeholder="Enter mobile number"
          />

          <label className="ml-2 font-normal block mt-4">Date of Birth:</label>
          <input
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="date"
          />

          {/* <label className="ml-2 font-normal block mt-4">Profession:</label>
          <input
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            placeholder="Enter profession"
          /> */}

          <label className="ml-2 font-normal block mt-4">Profile Image:</label>
          {imagePreview && (
            <img
              src={getImageUrl(imagePreview)}
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

          <label className="ml-2 font-normal block mt-4">Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

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

          <label className="ml-2 font-normal block mt-4">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full h-10 mb-1 border rounded-xl pl-3 pr-10 py-2 border-gray-500"
          >
            <option value="">Select Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 mt-6 rounded-2xl"
          >
            {loading ? "Updating..." : "Update Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdmin;
