import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { createDriverApi } from "../../Services/DriverApi";
import { getAllRegions } from "../../Services/RegionApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select, Switch } from "antd";
const { Option } = Select;

const CreateDriver = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState({});

    // Regions from API
    const [regions, setRegions] = useState([]);

    // Form state
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
        grade: "A",
    });

    // File previews
    const [previews, setPreviews] = useState({
        profilePic: "",
        licensePhoto: "",
        adhaarFrontPhoto: "",
        adhaarBackPhoto: "",
        panFrontPhoto: "",
        panBackPhoto: "",
        policeVerificationPhoto: "",
    });

    // Fetch regions
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const res = await getAllRegions({ page: 1, rowsPerPage: 100 });
                if (res?.status) {
                    setRegions(res.data || []);
                }
            } catch (err) {
                toast.error("Failed to load regions");
            }
        };
        fetchRegions();
    }, []);

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

    useEffect(() => {
        return () => {
            Object.values(previews).forEach((url) => {
                if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    const handleClear = () => {
        setFormData({
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
            grade: "A",
        });

        setPreviews({
            profilePic: "",
            licensePhoto: "",
            adhaarFrontPhoto: "",
            adhaarBackPhoto: "",
            panFrontPhoto: "",
            panBackPhoto: "",
            policeVerificationPhoto: "",
        });

        setApiError({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError({});

        const errors = {};
        if (!formData.name.trim()) errors.name = "Name is required.";
        if (!formData.phone) {
            errors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = "Phone number must be 10 digits";
        }
        if (!formData.email.trim()) errors.email = "Email is required.";

        if (Object.keys(errors).length > 0) {
            setApiError(errors);
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach((key) => {
                if (formData[key] !== null && formData[key] !== undefined && typeof formData[key] !== "object") {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (formData.profilePic) formDataToSend.append("profilePic", formData.profilePic);
            if (formData.licensePhoto) formDataToSend.append("licensePhoto", formData.licensePhoto);
            if (formData.adhaarFrontPhoto) formDataToSend.append("adhaarFrontPhoto", formData.adhaarFrontPhoto);
            if (formData.adhaarBackPhoto) formDataToSend.append("adhaarBackPhoto", formData.adhaarBackPhoto);
            if (formData.panFrontPhoto) formDataToSend.append("panFrontPhoto", formData.panFrontPhoto);
            if (formData.panBackPhoto) formDataToSend.append("panBackPhoto", formData.panBackPhoto);
            if (formData.policeVerificationPhoto) formDataToSend.append("policeVerificationPhoto", formData.policeVerificationPhoto);

            const res = await createDriverApi(formDataToSend);

            if (res?.status) {
                toast.success("Chauffeur created successfully!");
                navigate(-1);
            } else {
                const errorMsg = res?.message || "Failed to create chauffeur";
                toast.error(errorMsg);
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message || "Server error";
            console.error("Error creating chauffeur:", error);
            toast.error(errMsg);
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
                    {/* Personal Info */}
                    <label className="ml-2 mt-4 font-normal block">First Name *</label>
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

                    {/* last name */}
                    <label className="ml-2 mt-5 font-normal block">Last Name</label>
                      <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="lastName"
                        placeholder="Enter Last Name (optional)"
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
                            const value = e.target.value.replace(/\D/g, ""); // remove letters
                            setFormData({ ...formData, phone: value });
                        }}
                    />

                    {apiError.phone && <p className="text-red-500 text-sm ml-2">{apiError.phone}</p>}

                    <label className="ml-2 mt-5 font-normal block">Alternate Phone</label>
                    <input
                        className={`w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500 ${apiError.alternatePhone ? "border-red-500" : "border-gray-500"
                            }`}
                        type="tel"
                        name="alternatePhone"
                        placeholder="Alternate phone (optional)"
                        value={formData.alternatePhone}
                        maxLength={10}
                        inputMode="numeric"
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                            setFormData({ ...formData, alternatePhone: value });
                        }}
                    />
                    {apiError.alternatePhone && (
                        <p className="text-red-500 text-sm ml-2">{apiError.alternatePhone}</p>
                    )}

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
                    {apiError.licenseNumber && <p className="text-red-500 text-sm ml-2">{apiError.licenseNumber}</p>}

                    <label className="ml-2 mt-5 font-normal block">License Expiry</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="date"
                        name="licenseExpiry"
                        value={formData.licenseExpiry}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">License Photo *</label>
                    {previews.licensePhoto && (
                        <img
                            src={previews.licensePhoto}
                            alt="License Preview"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="license-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload License Photo
                    </label>
                    <input
                        id="license-upload"
                        className="hidden"
                        type="file"
                        name="licensePhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {apiError.licensePhoto && <p className="text-red-500 text-sm ml-2">{apiError.licensePhoto}</p>}

                    {/* Aadhaar */}
                    <label className="ml-2 mt-5 font-normal block">Aadhaar Number *</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="text"
                        name="adhaarNumber"
                        placeholder="Enter Aadhaar number"
                        maxLength={12}
                        inputMode="numeric"
                        value={formData.adhaarNumber}
                        onChange={handleChange}
                    />
                    {apiError.adhaarNumber && <p className="text-red-500 text-sm ml-2">{apiError.adhaarNumber}</p>}

                    <label className="ml-2 mt-5 font-normal block">Aadhaar Front Photo *</label>
                    {previews.adhaarFrontPhoto && (
                        <img
                            src={previews.adhaarFrontPhoto}
                            alt="Aadhaar Front"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="adhaar-front-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload Aadhaar Front
                    </label>
                    <input
                        id="adhaar-front-upload"
                        className="hidden"
                        type="file"
                        name="adhaarFrontPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {apiError.adhaarFrontPhoto && <p className="text-red-500 text-sm ml-2">{apiError.adhaarFrontPhoto}</p>}

                    <label className="ml-2 mt-5 font-normal block">Aadhaar Back Photo *</label>
                    {previews.adhaarBackPhoto && (
                        <img
                            src={previews.adhaarBackPhoto}
                            alt="Aadhaar Back"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="adhaar-back-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload Aadhaar Back
                    </label>
                    <input
                        id="adhaar-back-upload"
                        className="hidden"
                        type="file"
                        name="adhaarBackPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {apiError.adhaarBackPhoto && <p className="text-red-500 text-sm ml-2">{apiError.adhaarBackPhoto}</p>}

                    {/* PAN */}
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

                    <label className="ml-2 mt-5 font-normal block">PAN Front Photo *</label>
                    {previews.panFrontPhoto && (
                        <img
                            src={previews.panFrontPhoto}
                            alt="PAN Front"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="pan-front-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload PAN Front
                    </label>
                    <input
                        id="pan-front-upload"
                        className="hidden"
                        type="file"
                        name="panFrontPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {apiError.panFrontPhoto && <p className="text-red-500 text-sm ml-2">{apiError.panFrontPhoto}</p>}

                    <label className="ml-2 mt-5 font-normal block">PAN Back Photo *</label>
                    {previews.panBackPhoto && (
                        <img
                            src={previews.panBackPhoto}
                            alt="PAN Back"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="pan-back-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload PAN Back
                    </label>
                    <input
                        id="pan-back-upload"
                        className="hidden"
                        type="file"
                        name="panBackPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {apiError.panBackPhoto && <p className="text-red-500 text-sm ml-2">{apiError.panBackPhoto}</p>}

                    {/* Police Verification */}
                    <label className="ml-2 mt-5 font-normal block">Police Verification Expiry</label>
                    <input
                        className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                        type="date"
                        name="policeVerificationExpiry"
                        value={formData.policeVerificationExpiry}
                        onChange={handleChange}
                    />

                    <label className="ml-2 mt-5 font-normal block">Police Verification Photo</label>
                    {previews.policeVerificationPhoto && (
                        <img
                            src={previews.policeVerificationPhoto}
                            alt="Police Verification"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="police-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload Police Verification Photo
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
                    {previews.profilePic && (
                        <img
                            src={previews.profilePic}
                            alt="Profile Preview"
                            className="h-16 w-24 object-cover rounded mt-2 mb-2 ml-2 border border-gray-300"
                        />
                    )}
                    <label
                        htmlFor="profile-upload"
                        className="flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
                    >
                        🖼️ Upload Profile Picture
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

                    {/* Status Toggles - Small & Professional */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="ml-2 font-normal block">Is Verified</label>
                            <Switch
                                checked={formData.isVerified}
                                onChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                                checkedChildren="Yes"
                                unCheckedChildren="No"
                                size="default" // normal/small size
                            />
                            {apiError.isVerified && <p className="text-red-500 text-sm ml-2">{apiError.isVerified}</p>}
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
                            {apiError.isOnline && <p className="text-red-500 text-sm ml-2">{apiError.isOnline}</p>}
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
                            {apiError.isAvailable && <p className="text-red-500 text-sm ml-2">{apiError.isAvailable}</p>}
                        </div>
                    </div>

                    {/* Submit */}

                    <div className="flex justify-end gap-4 mt-8">

                        {/* CLEAR */}
                        <button
                            type="button"
                            onClick={handleClear}
                            className=" bg-gray-500 text-white py-2 px-6 rounded-2xl"
                        >
                            Clear
                        </button>

                        {/* BACK */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className=" bg-gray-500 text-white  py-2 px-6 rounded-2xl"
                        >
                            Back
                        </button>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white py-2 px-6 rounded-2xl"
                        >
                            {loading ? "Creating..." : "Create Chauffeur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDriver;