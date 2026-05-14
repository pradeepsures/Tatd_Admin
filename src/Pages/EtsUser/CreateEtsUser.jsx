import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Switch } from "antd";

import { createEtsUserApi } from "../../Services/EtsUserApi";

const CreateEtsUser = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState({});

    const [preview, setPreview] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        profilePic: "",
        professionalTitle: "",
        walletBalance: 0,
        isVerified: false,
        countryCode: "+91",
        dob: "",
        city: "",
    });



    // ✅ HANDLE INPUT
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ✅ SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError({});

        const errors = {};

        if (!formData.mobile.trim()) {
            errors.mobile = "Mobile number is required";
        }

        if (Object.keys(errors).length > 0) {
            setApiError(errors);
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach((key) => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const res = await createEtsUserApi(formDataToSend);
            // const res = await createEtsUserApi(formData);

            if (res?.status) {
                toast.success("ETS User created successfully!");
                navigate(-1);
            } else {
                toast.error(res?.message || "Failed to create user");
            }
        } catch (err) {
            toast.error(err.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    // ✅ CLEAR
    const handleClear = () => {
        setFormData({
            name: "",
            email: "",
            mobile: "",
            gender: "",
            profilePic: "",
            professionalTitle: "",
            walletBalance: 0,
            isVerified: false,
            countryCode: "+91",
            dob: "",
            city: "",
        });
        setApiError({});
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData({ ...formData, profilePic: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="m-3">

            <div className="mb-4">
                <Breaker />
            </div>

            <div className="mt-8 bg-white p-6 w-full rounded-xl shadow-xl">

                <form onSubmit={handleSubmit}>

                    {/* NAME */}
                    <label className="ml-2 mt-4 block">Name</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="name"
                        placeholder="Enter name"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    {/* EMAIL */}
                    <label className="ml-2 mt-5 block">Email</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {/* MOBILE */}
                    <label className="ml-2 mt-5 block">Mobile *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                    {apiError.mobile && (
                        <p className="text-red-500 text-sm ml-2">{apiError.mobile}</p>
                    )}

                    {/* COUNTRY CODE */}
                    <label className="ml-2 mt-5 block">Country Code</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                    />

                    {/* GENDER */}
                    <label className="ml-2 mt-5 block">Gender</label>
                    <select
                        className="w-full h-10 border rounded-xl pl-3 border-gray-500"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    {/* PROFILE PIC */}
                    <label className="ml-2 mt-5 block">Profile Picture</label>

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-full mt-2 mb-2 ml-2 border"
                        />
                    )}

                    <label
                        htmlFor="profile-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 px-4"
                    >
                        🖼️ Upload Profile Picture
                    </label>

                    <input
                        id="profile-upload"
                        type="file"
                        name="profilePic"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* PROFESSIONAL TITLE */}
                    <label className="ml-2 mt-5 block">Professional Title</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="professionalTitle"
                        placeholder="e.g. Doctor, Engineer"
                        value={formData.professionalTitle}
                        onChange={handleChange}
                    />

                    {/* WALLET */}
                    <label className="ml-2 mt-5 block">Wallet Balance</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="number"
                        name="walletBalance"
                        value={formData.walletBalance}
                        onChange={handleChange}
                    />

                    {/* DOB */}
                    <label className="ml-2 mt-5 block">Date of Birth</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                    />

                    {/* CITY */}
                    <label className="ml-2 mt-5 block">City</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleChange}
                    />

                    {/* VERIFIED */}
                    <div className="mt-6">
                        <label className="ml-2 block">Verified</label>
                        <Switch
                            checked={formData.isVerified}
                            onChange={(checked) =>
                                setFormData({ ...formData, isVerified: checked })
                            }
                            checkedChildren="Yes"
                            unCheckedChildren="No"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 mt-8">

                        <button
                            type="submit"
                            className="bg-primary text-white py-3 px-6 rounded-2xl hover:scale-105"
                        >
                            {loading ? "Creating..." : "Create User"}
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            className=" bg-gray-500 text-white py-3 px-6 rounded-2xl"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className=" bg-gray-500 text-white py-3 px-6 rounded-2xl"
                        >
                            Back
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateEtsUser;