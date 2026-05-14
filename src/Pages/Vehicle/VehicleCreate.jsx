import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createVehicle } from "../../Services/VehicleApi";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllSegment } from "../../Services/SegmentApi";
import { Select, Switch } from "antd";
import Breaker from "../../compoents/Breaker";

const { Option } = Select;

const CreateVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});

  const [drivers, setDrivers] = useState([]);
  const [segments, setSegments] = useState([]);

  // Form state (same structure as your driver page)
  const [formData, setFormData] = useState({
    driver: "",
    segment: "",
    brand: "",
    model: "",
    fuelType: "diesel",
    year: "",
    color: "",
    carNumber: "",
    bootSpace: "",
    certificateNumber: "",
    certificateExpiry: "",
    insuranceExpiry: "",
    pollutionExpiry: "",
    rcExpeiry: "",
    capacity: "",
    isActive: true,
    carImage: [],
    documentImage: [],
    certificatePhoto: null,
    rcFrontPhoto: null,
    rcBackPhoto: null,
  });

  // Image previews (exactly like CreateDriver)
  const [previews, setPreviews] = useState({
    certificatePhoto: "",
    rcFrontPhoto: "",
    rcBackPhoto: "",
    carImage: [],
    documentImage: [],
  });

  // ================= FETCH DRIVERS & SEGMENTS =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const driversRes = await getAllDrivers({
          page: 1,
          rowsPerPage: 50,
          searchQuery: "",
        });

        const segmentsRes = await getAllSegment({
          page: 1,
          rowsPerPage: 50,
        });

        setDrivers(driversRes?.data || []);
        setSegments(segmentsRes?.data || []);
      } catch (err) {
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // ================= FORM INPUT CHANGES =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ================= FILE HANDLER WITH PREVIEW =================
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];

    if (!file) return;

    // Single image fields
    if (["certificatePhoto", "rcFrontPhoto", "rcBackPhoto"].includes(name)) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: url }));
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    // Multiple image fields (carImage, documentImage)
    const newFiles = Array.from(files);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));

    setPreviews((prev) => ({
      ...prev,
      [name]: (prev[name] || []).concat(newUrls),
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: (prev[name] || []).concat(newFiles),
    }));
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((item) => {
        if (Array.isArray(item)) {
          item.forEach((url) => {
            if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
          });
        } else if (item && item.startsWith("blob:")) {
          URL.revokeObjectURL(item);
        }
      });
    };
  }, [previews]);

  // ================= FRONTEND VALIDATION =================
  const validateForm = () => {
    const errors = {};
    if (!formData.driver) errors.driver = "Chauffeur is required.";
    if (!formData.segment) errors.segment = "Segment is required.";
    if (!formData.brand) errors.brand = "Brand is required.";
    if (!formData.model) errors.model = "Model is required.";
    if (!formData.year) errors.year = "Year is required.";
    if (!formData.carNumber) errors.carNumber = "Vehicle number is required.";

    setApiError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClear = () => {
    setFormData({
      driver: "",
      segment: "",
      brand: "",
      fuelType: "diesel",
      model: "",
      year: "",
      carNumber: "",
      certificateNumber: "",
      certificateExpiry: "",
      insuranceExpiry: "",
      pollutionExpiry: "",
      rcExpeiry: "",
      capacity: "",
      isActive: true,
      carImage: [],
      documentImage: [],
      certificatePhoto: null,
      rcFrontPhoto: null,
      rcBackPhoto: null,
    });
  };


  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError({});
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();

      // Append all simple text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          typeof value !== "object" &&
          !Array.isArray(value)
        ) {
          data.append(key, value);
        }
      });

      // Car images (multiple)
      if (formData.carImage && formData.carImage.length > 0) {
        formData.carImage.forEach((file) => {
          data.append("carImage", file);
        });
      }

      // Document images (multiple)
      if (formData.documentImage && formData.documentImage.length > 0) {
        formData.documentImage.forEach((file) => {
          data.append("documentImage", file);
        });
      }

      // Single files
      if (formData.certificatePhoto) data.append("certificatePhoto", formData.certificatePhoto);
      if (formData.rcFrontPhoto) data.append("rcFrontPhoto", formData.rcFrontPhoto);
      if (formData.rcBackPhoto) data.append("rcBackPhoto", formData.rcBackPhoto);

      const res = await createVehicle(data);

      if (res?.status) {
        toast.success("Vehicle Created Successfully");
        navigate(-1);
      } else {
        const errMsg = res?.message || "Failed to create vehicle";
        toast.error(errMsg);
      }
    } catch (err) {
      console.error("Error creating vehicle:", err);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // No loader component, just simple spinning text
  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent border-purple-600 rounded-full mr-2" />
        <span>Please wait...</span>
      </div>
    );
  }

  return (
    <div className="m-3">
      <Breaker />

      <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* DRIVER */}
          <label className="ml-2 mt-4 font-normal block">Driver *</label>
          <Select
            showSearch
            placeholder="Select chauffer"
            value={formData.driver || undefined}
            className="w-full h-10 mb-3 border rounded-xl"
            onChange={(val) => setFormData((prev) => ({ ...prev, driver: val }))}
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {drivers.map((d) => (
              <Option key={d._id} value={d._id}>
                {`${d.name} | ${d.phone} | ${d.email}`}
              </Option>
            ))}
          </Select>
          {apiError.driver && <p className="text-red-500 text-sm ml-2">{apiError.driver}</p>}

          {/* SEGMENT */}
          <label className="ml-2 mt-5 font-normal block">Segment *</label>
          <Select
            showSearch
            placeholder="Select segment"
            value={formData.segment || undefined}
            className="w-full h-10 mb-3 border rounded-xl"
            onChange={(val) => {
              const seg = segments.find((s) => s._id === val);
              setFormData((prev) => ({
                ...prev,
                segment: val,
                capacity: seg?.maxCapacity || "",
              }));
            }}
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {segments.map((s) => (
              <Option key={s._id} value={s._id}>
                {/* {`${s.name} (${s.maxCapacity})`} */}
              </Option>
            ))}
          </Select>
          {apiError.segment && <p className="text-red-500 text-sm ml-2">{apiError.segment}</p>}

          {/* BASIC FIELDS */}
          {/* {[" Vehicle Brand", "Vehicle model", "fuel Type", " Manufacturer Year", "Vehicle Number", "color", "BootSpace (Lr)", "Capacity (Seater)", "Certificate Number"].map(
            (name) => (
              <div key={name}>
                <label className="ml-2 mt-5 font-normal block capitalize">{name}</label>
                <input
                  type={name === "year" ? "number" : "text"}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                  placeholder={`Enter ${name}`}
                />
                {apiError[name] && <p className="text-red-500 text-sm ml-2">{apiError[name]}</p>}
              </div>
            )
          )} */}

          {[
            "Vehicle Brand",
            "Vehicle model",
            "fuel Type",
            " Manufacturer Year",
            "Vehicle Number",
            "color",
            "BootSpace (Lr)",
            "Capacity (Seater)",
            "Certificate Number"
          ].map((name) => (
            <div key={name}>
              <label className="ml-2 mt-5 font-normal block capitalize">{name}</label>

              {/* ✅ FUEL TYPE DROPDOWN */}
              {name === "fuel Type" ? (
                <select
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                >
                  <option value="">Select Fuel Type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                </select>
              ) : (
                <input
                  type={name === "year" ? "number" : "text"}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
                  placeholder={`Enter ${name}`}
                />
              )}

              {apiError[name] && (
                <p className="text-red-500 text-sm ml-2">{apiError[name]}</p>
              )}
            </div>
          ))}

          {/* DATE FIELDS */}
          {["Certificate Expiry", "Insurance Expiry", "Pollution Expiry", "RC Expiry"].map((name) => (
            <div key={name}>
              <label className="ml-2 mt-5 font-normal block">{name}</label>
              <input
                type="date"
                name={name}
                value={formData[name] || ""}
                onChange={handleChange}
                className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
              />
              {apiError[name] && <p className="text-red-500 text-sm ml-2">{apiError[name]}</p>}
            </div>
          ))}

          {/* STATUS - ACTIVE */}
          <div className="mt-8">
            <label className="ml-2 font-normal block">Active</label>
            <Switch
              checked={formData.isActive}
              onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              checkedChildren="Yes"
              unCheckedChildren="No"
              size="default"
            />
          </div>

          {/* CERTIFICATE PHOTO */}
          <label className="ml-2 mt-5 font-normal block">Certificate Photo</label>
          {previews.certificatePhoto && (
            <img
              src={previews.certificatePhoto}
              alt="Certificate"
              className="h-16 w-24 object-cover rounded border border-gray-300 ml-2 mt-2"
            />
          )}
          <label
            htmlFor="certificate-upload"
            className="ml-2 mt-2 flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
          >
            🖼️ Upload Certificate Photo
          </label>
          <input
            id="certificate-upload"
            className="hidden"
            type="file"
            name="certificatePhoto"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* RC FRONT PHOTO */}
          <label className="ml-2 mt-5 font-normal block">RC Front Photo</label>
          {previews.rcFrontPhoto && (
            <img
              src={previews.rcFrontPhoto}
              alt="RC Front"
              className="h-16 w-24 object-cover rounded border border-gray-300 ml-2 mt-2"
            />
          )}
          <label
            htmlFor="rc-front-upload"
            className="ml-2 mt-2 flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
          >
            🖼️ Upload RC Front Photo
          </label>
          <input
            id="rc-front-upload"
            className="hidden"
            type="file"
            name="rcFrontPhoto"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* RC BACK PHOTO */}
          <label className="ml-2 mt-5 font-normal block">RC Back Photo</label>
          {previews.rcBackPhoto && (
            <img
              src={previews.rcBackPhoto}
              alt="RC Back"
              className="h-16 w-24 object-cover rounded border border-gray-300 ml-2 mt-2"
            />
          )}
          <label
            htmlFor="rc-back-upload"
            className="ml-2 mt-2 flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
          >
            🖼️ Upload RC Back Photo
          </label>
          <input
            id="rc-back-upload"
            className="hidden"
            type="file"
            name="rcBackPhoto"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* CAR IMAGES */}
          <label className="ml-2 mt-5 font-normal block">Vehicle Images</label>
          <div className="flex gap-2 flex-wrap ml-2 mt-2">
            {previews.carImage.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Car ${i}`}
                className="h-16 w-24 object-cover rounded border border-gray-300"
              />
            ))}
          </div>
          <label
            htmlFor="car-images-upload"
            className="ml-2 mt-2 flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
          >
            🖼️ Upload Car Images
          </label>
          <input
            id="car-images-upload"
            className="hidden"
            type="file"
            name="carImage"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* DOCUMENT IMAGES */}
          <label className="ml-2 mt-5 font-normal block">Miscellaneous Documents</label>
          <div className="flex gap-2 flex-wrap ml-2 mt-2">
            {previews.documentImage.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Document ${i}`}
                className="h-16 w-24 object-cover rounded border border-gray-300"
              />
            ))}
          </div>
          <label
            htmlFor="document-images-upload"
            className="ml-2 mt-2 flex items-center justify-center h-10 border border-gray-500 rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors px-4"
          >
            🖼️ Upload Document Images
          </label>
          <input
            id="document-images-upload"
            className="hidden"
            type="file"
            name="documentImage"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* SUBMIT BUTTON */}
          {/* <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 mt-8 rounded-xl"
          >
            {loading ? "Creating Vehicle..." : "Create Vehicle"}
          </button> */}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            {/* cleaer button */}
            <button
              type="button"
              onClick={handleClear}
              className=" bg-gray-500 text-white py-2 px-6 rounded-2xl"
            >
              Clear
            </button>

            {/* back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className=" bg-gray-700 text-white py-2 px-6 rounded-2xl"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2 px-6 rounded-2xl"
            >
              {loading ? "Creating Vehicle..." : "Create Vehicle"}
            </button>



          </div>




        </form>
      </div>
    </div>
  );
};

export default CreateVehicle;
