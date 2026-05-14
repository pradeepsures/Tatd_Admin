import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { getSingleDriver, updateDriver } from "../../Services/DriverApi"; // ← adjust path if needed
import { getAllRegions } from "../../Services/RegionApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select, Switch } from "antd";
const { Option } = Select;

const UpdateDriver = () => {
    const { id } = useParams(); // get driver id from URL
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [apiError, setApiError] = useState({});

    // Regions
    const [regions, setRegions] = useState([]);

    // Form state - same structure as create
    const [formData, setFormData] = useState({
        name: "",
        midName: "",
        lastName: "",
        email: "",
        phone: "",
        alternatePhone: "",
        permanentAddress: "",
        currentAddress: "",
        licenseNumber: "",
        licenseExpiry: "",
        adhaarNumber: "",
        panNumber: "",
        policeVerificationExpiry: "",
        isVerified: false,
        isOnline: false,
        isAvailable: false,
        region: "",
        state: "",
        city: "",
        pincode: "",
        grade: "D",
    });

    // File previews (new uploads) + existing images from backend
    const [previews, setPreviews] = useState({
        profilePic: "",
        licensePhoto: "",
        adhaarFrontPhoto: "",
        adhaarBackPhoto: "",
        panFrontPhoto: "",
        panBackPhoto: "",
        policeVerificationPhoto: "",
    });

    // Existing image URLs from backend (for display when no new file selected)
    const [existingImages, setExistingImages] = useState({
        profilePic: "",
        licensePhoto: "",
        adhaarFrontPhoto: "",
        adhaarBackPhoto: "",
        panFrontPhoto: "",
        panBackPhoto: "",
        policeVerificationPhoto: "",
    });

    // Fetch regions + single driver data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setPageLoading(true);

                // 1. Fetch regions
                const regionsRes = await getAllRegions({ page: 1, rowsPerPage: 100 });
                if (regionsRes?.status) {
                    setRegions(regionsRes.data || []);
                }

                // 2. Fetch driver
                const driverRes = await getSingleDriver(id);
                if (driverRes?.status && driverRes.data) {
                    const driver = driverRes.data;

                    setFormData({
                        name: driver.name || "",
                        midName: driver.midName || "",
                        lastName: driver.lastName || "",
                        email: driver.email || "",
                        phone: driver.phone || "",
                        alternatePhone: driver.alternatePhone || "",
                        permanentAddress: driver.permanentAddress || "",
                        currentAddress: driver.currentAddress || "",
                        licenseNumber: driver.licenseNumber || "",
                        licenseExpiry: driver.licenseExpiry
                            ? new Date(driver.licenseExpiry).toISOString().split("T")[0]
                            : "",
                        adhaarNumber: driver.adhaarNumber || "",
                        panNumber: driver.panNumber || "",
                        policeVerificationExpiry: driver.policeVerificationExpiry
                            ? new Date(driver.policeVerificationExpiry).toISOString().split("T")[0]
                            : "",
                        isVerified: driver.isVerified || false,
                        isOnline: driver.isOnline || false,
                        isAvailable: driver.isAvailable || false,
                        region: driver.region?._id || driver.region || "", // assuming region is populated or just ID
                        state: driver.state || "",
                        city: driver.city || "",
                        pincode: driver.pincode || "",
                        grade: driver.grade || "D",
                    });

                    // Set existing image URLs (adjust field names if your backend uses different keys)
                    setExistingImages({
                        profilePic: driver.profilePic || "",
                        licensePhoto: driver.licensePhoto || "",
                        adhaarFrontPhoto: driver.adhaarFrontPhoto || "",
                        adhaarBackPhoto: driver.adhaarBackPhoto || "",
                        panFrontPhoto: driver.panFrontPhoto || "",
                        panBackPhoto: driver.panBackPhoto || "",
                        policeVerificationPhoto: driver.policeVerificationPhoto || "",
                    });
                } else {
                    toast.error("Chauffeur not found");
                    navigate(-1);
                }
            } catch (err) {
                toast.error("Failed to load chauffeur data");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
            setFormData((prev) => ({ ...prev, [name]: file }));
        }
    };

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            Object.values(previews).forEach((url) => {
                if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError({});

        // Basic validation (you can expand it)
        const errors = {};
        if (!formData.name.trim()) errors.name = "Name is required.";
        if (!formData.phone) {
            errors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = "Phone number must be 10 digits";
        }
        if (!formData.email.trim()) errors.email = "Email is required.";
        if (!formData.region) errors.region = "Region is required.";

        if (Object.keys(errors).length > 0) {
            setApiError(errors);
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Append all text/boolean/date fields
            Object.keys(formData).forEach((key) => {
                if (key === "region" || key === "isVerified" || key === "isOnline" || key === "isAvailable") {
                    formDataToSend.append(key, formData[key]);
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    if (formData[key] instanceof File) {
                        formDataToSend.append(key, formData[key]);
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            console.log("====== FINAL PAYLOAD (FormData) ======");

            for (let [key, value] of formDataToSend.entries()) {
                console.log(key, ":", value, "| type:", typeof value);
            }

            const res = await updateDriver(id, formDataToSend);

            if (res?.status) {
                toast.success("Chauffeur updated successfully!");
                navigate(-1);
            } else {
                toast.error(res?.message || "Failed to update chauffeur");
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message || "Server error";
            console.error("Error updating chauffeur:", error);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <Loader />;
    if (loading) return <Loader />;

    return (
        <div className="m-3">
            <div className="mb-4">
                <Breaker />
            </div>

            <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 ml-2">Update Chauffeur</h2>

                <form onSubmit={handleSubmit}>
                    {/* Personal Info */}
                    <label className="ml-2 mt-4 font-normal block">Full Name *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {apiError.name && <p className="text-red-500 text-sm ml-2">{apiError.name}</p>}

                       {/* middle name */}
                        <label className="ml-2 mt-5 font-normal block">Middle Name</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="midName"
                        placeholder="Enter middle name (optional)"
                        value={formData.midName}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Last Name</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="lastName"
                        placeholder="Enter last name (optional)"
                        value={formData.lastName}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Email</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Phone Number *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        maxLength={10}
                        inputMode="numeric"
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setFormData({ ...formData, phone: value });
                        }}
                    />
                    {apiError.phone && <p className="text-red-500 text-sm ml-2">{apiError.phone}</p>}

                    <label className="ml-2 mt-5 font-normal block">Alternate Phone</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="tel"
                        name="alternatePhone"
                        placeholder="Alternate phone (optional)"
                        value={formData.alternatePhone}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Region *</label>
                    <Select
                        value={formData.region}
                        onChange={(val) => setFormData({ ...formData, region: val })}
                        className="w-full h-10 mb-1 border rounded-xl"
                        placeholder="Select Region"
                        showSearch
                        optionFilterProp="children"
                    >
                        {regions.map((r) => (
                            <Option key={r._id} value={r._id}>
                                {r.name} ({r.state})
                            </Option>
                        ))}
                    </Select>
                    {apiError.region && <p className="text-red-500 text-sm ml-2">{apiError.region}</p>}

                        {/* state */}
                    <label className="ml-2 mt-5 font-normal block">State</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="state"
                        placeholder="Enter state"
                        value={formData.state}
                        onChange={handleChange}
                    />

                          {/* city */}
                    <label className="ml-2 mt-5 font-normal block">City</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                         
                         {/* pincode */}
                    <label className="ml-2 mt-5 font-normal block">Pincode</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="pincode"
                        placeholder="Enter pincode"
                        value={formData.pincode}
                        maxLength={6}
                        onChange={handleChange}
                    />
                       {/* grade */}
                    <label className="ml-2 mt-5 font-normal block">Grade</label>
                    <Select
                        value={formData.grade}
                        onChange={(val) => setFormData({ ...formData, grade: val })}
                        className="w-full h-10 mb-1 border rounded-xl"
                    >
                        <Option value="A">A</Option>
                        <Option value="B">B</Option>
                        <Option value="C">C</Option>
                        <Option value="D">D</Option>
                    </Select>

                    {/* Addresses */}
                    <label className="ml-2 mt-5 font-normal block">Permanent Address</label>
                    <textarea
                        className="w-full h-20 mb-1 border rounded-xl pl-4 pt-2 border-gray-500 resize-none"
                        name="permanentAddress"
                        placeholder="Permanent address"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Current Address</label>
                    <textarea
                        className="w-full h-20 mb-1 border rounded-xl pl-4 pt-2 border-gray-500 resize-none"
                        name="currentAddress"
                        placeholder="Current address"
                        value={formData.currentAddress}
                        onChange={handleChange}
                    />

                    {/* License */}
                    <label className="ml-2 mt-5 font-normal block">License Number *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="licenseNumber"
                        placeholder="Enter license number"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">License Expiry</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="date"
                        name="licenseExpiry"
                        value={formData.licenseExpiry}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">License Photo *</label>
                    <div className="mb-2">
                        {previews.licensePhoto ? (
                            <img
                                src={previews.licensePhoto}
                                alt="New License Preview"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : existingImages.licensePhoto ? (
                            <img
                                src={existingImages.licensePhoto}
                                alt="Current License"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : null}
                    </div>
                    <label
                        htmlFor="license-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.licensePhoto ? "Replace License Photo" : "Upload / Replace License Photo"}
                    </label>
                    <input
                        id="license-upload"
                        className="hidden"
                        type="file"
                        name="licensePhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Aadhaar, PAN, Police Verification, Profile Pic - same pattern */}

                    <label className="ml-2 mt-5 font-normal block">Aadhaar Number *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="adhaarNumber"
                        placeholder="Enter Aadhaar number"
                        value={formData.adhaarNumber}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Aadhaar Front Photo *</label>
                    <div className="mb-2">
                        {previews.adhaarFrontPhoto ? (
                            <img src={previews.adhaarFrontPhoto} alt="New Aadhaar Front" className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300" />
                        ) : existingImages.adhaarFrontPhoto ? (
                            <img src={existingImages.adhaarFrontPhoto} alt="Current Aadhaar Front" className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300" />
                        ) : null}
                    </div>
                    <label
                        htmlFor="adhaar-front-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.adhaarFrontPhoto ? "Replace" : "Upload / Replace"} Aadhaar Front
                    </label>
                    <input
                        id="adhaar-front-upload"
                        className="hidden"
                        type="file"
                        name="adhaarFrontPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Aadhaar Back Photo */}
                    <label className="ml-2 mt-5 font-normal block">Aadhaar Back Photo *</label>
                    <div className="mb-2">
                        {previews.adhaarBackPhoto ? (
                            <img
                                src={previews.adhaarBackPhoto}
                                alt="New Aadhaar Back"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : existingImages.adhaarBackPhoto ? (
                            <img
                                src={existingImages.adhaarBackPhoto}
                                alt="Current Aadhaar Back"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : null}
                    </div>
                    <label
                        htmlFor="adhaar-back-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.adhaarBackPhoto ? "Replace Aadhaar Back" : "Upload / Replace Aadhaar Back"}
                    </label>
                    <input
                        id="adhaar-back-upload"
                        className="hidden"
                        type="file"
                        name="adhaarBackPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* PAN Number */}
                    <label className="ml-2 mt-5 font-normal block">PAN Number *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="panNumber"
                        placeholder="Enter PAN number"
                        value={formData.panNumber}
                        onChange={handleChange}
                    />
                    {apiError.panNumber && <p className="text-red-500 text-sm ml-2">{apiError.panNumber}</p>}

                    {/* PAN Front Photo */}
                    <label className="ml-2 mt-5 font-normal block">PAN Front Photo *</label>
                    <div className="mb-2">
                        {previews.panFrontPhoto ? (
                            <img
                                src={previews.panFrontPhoto}
                                alt="New PAN Front"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : existingImages.panFrontPhoto ? (
                            <img
                                src={existingImages.panFrontPhoto}
                                alt="Current PAN Front"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : null}
                    </div>
                    <label
                        htmlFor="pan-front-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.panFrontPhoto ? "Replace PAN Front" : "Upload / Replace PAN Front"}
                    </label>
                    <input
                        id="pan-front-upload"
                        className="hidden"
                        type="file"
                        name="panFrontPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* PAN Back Photo */}
                    <label className="ml-2 mt-5 font-normal block">PAN Back Photo *</label>
                    <div className="mb-2">
                        {previews.panBackPhoto ? (
                            <img
                                src={previews.panBackPhoto}
                                alt="New PAN Back"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : existingImages.panBackPhoto ? (
                            <img
                                src={existingImages.panBackPhoto}
                                alt="Current PAN Back"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : null}
                    </div>
                    <label
                        htmlFor="pan-back-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.panBackPhoto ? "Replace PAN Back" : "Upload / Replace PAN Back"}
                    </label>
                    <input
                        id="pan-back-upload"
                        className="hidden"
                        type="file"
                        name="panBackPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Police Verification Expiry */}
                    <label className="ml-2 mt-5 font-normal block">Police Verification Expiry</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="date"
                        name="policeVerificationExpiry"
                        value={formData.policeVerificationExpiry}
                        onChange={handleChange}
                    />

                    {/* Police Verification Photo */}
                    <label className="ml-2 mt-5 font-normal block">Police Verification Photo</label>
                    <div className="mb-2">
                        {previews.policeVerificationPhoto ? (
                            <img
                                src={previews.policeVerificationPhoto}
                                alt="New Police Verification"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : existingImages.policeVerificationPhoto ? (
                            <img
                                src={existingImages.policeVerificationPhoto}
                                alt="Current Police Verification"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : null}
                    </div>
                    <label
                        htmlFor="police-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.policeVerificationPhoto ? "Replace Police Verification" : "Upload / Replace Police Verification"}
                    </label>
                    <input
                        id="police-upload"
                        className="hidden"
                        type="file"
                        name="policeVerificationPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Profile Picture */}
                    <label className="ml-2 mt-5 font-normal block">Profile Picture *</label>
                    <div className="mb-2">
                        {previews.profilePic ? (
                            <img
                                src={previews.profilePic}
                                alt="New Profile Preview"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : existingImages.profilePic ? (
                            <img
                                src={existingImages.profilePic}
                                alt="Current Profile"
                                className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                            />
                        ) : null}
                    </div>
                    <label
                        htmlFor="profile-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ {previews.profilePic ? "Replace Profile Picture" : "Upload / Replace Profile Picture"}
                    </label>
                    <input
                        id="profile-upload"
                        className="hidden"
                        type="file"
                        name="profilePic"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {apiError.profilePic && <p className="text-red-500 text-sm ml-2">{apiError.profilePic}</p>}

                    {/* Status Toggles */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="ml-2 font-normal block">Is Verified</label>
                            <Switch
                                checked={formData.isVerified}
                                onChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                                checkedChildren="Yes"
                                unCheckedChildren="No"
                                size="default"
                            />
                        </div>

                        <div>
                            <label className="ml-2 font-normal block">Is Online</label>
                            <Switch
                                checked={formData.isOnline}
                                onChange={(checked) => setFormData({ ...formData, isOnline: checked })}
                                checkedChildren="Online"
                                unCheckedChildren="Offline"
                                size="default"
                            />
                        </div>

                        <div>
                            <label className="ml-2 font-normal block">Is Available</label>
                            <Switch
                                checked={formData.isAvailable}
                                onChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                                checkedChildren="Available"
                                unCheckedChildren="Busy"
                                size="default"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end items-center gap-4 mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 px-6 rounded-2xl"
                        >
                            {loading ? "Updating Chauffeur..." : "Update Chauffeur"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-gray-500 text-white py-3 px-6 rounded-2xl hover:bg-gray-600 transition-colors"
                        >
                            Back
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default UpdateDriver;