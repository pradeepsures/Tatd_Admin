import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { createDriverApi } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select, Switch } from "antd";
const { Option } = Select;
import { getAllVehiclePreferences } from "../../Services/VehiclePreferenceApi";
import { getAllVehiclePreferenceCategories } from "../../Services/VehiclePreferenceCategoryApi";
import useLocationOptions from "../../hooks/useLocationOptions";

const CreateDriver = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});

  const [vehiclePrefs, setVehiclePrefs] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);

  const permAddressRef = useRef(null);
  const currAddressRef = useRef(null);
  const permAutocompleteRef = useRef(null);
  const currAutocompleteRef = useRef(null);
  const serviceAreaAddressRefs = useRef([]);
  const serviceAreaAutocompleteRefs = useRef([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    midName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    gender: "",
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
    state: "",
    city: "",
    pincode: "",
    serviceArea: [],
    serviceRadius: "",
    vehiclePreferences: [],
    vehiclePreferenceCategories: [],
  });
  const { states, cities, statesLoading, citiesLoading } = useLocationOptions(formData.state);

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

  // LOAD DROPDOWNS
  useEffect(() => {
    const loadData = async () => {
      try {
        const prefs = await getAllVehiclePreferences({});
        const cats = await getAllVehiclePreferenceCategories({});

        setVehiclePrefs(prefs?.data || []);
        setVehicleCategories(cats?.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    loadData();
  }, []);

  // Load Google Maps Script
  useEffect(() => {
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAw5iIsWyZnq8Ejy8jLC2jcKvNRxI5Ll3w";
    
    if (window.google && window.google.maps && window.google.maps.places) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.querySelector(`script[data-google-maps]`);
    if (!existing) {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.setAttribute('data-google-maps', 'true');
      s.onload = () => setScriptLoaded(true);
      document.head.appendChild(s);
    } else {
      existing.addEventListener('load', () => setScriptLoaded(true));
    }
  }, []);

  const parseAddressComponents = (place, addressType) => {
    let pincode = "";

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes("postal_code")) {
          pincode = component.long_name;
        }
      }
    }

    const formattedAddress = place.formatted_address || place.name || "";

    setFormData((prev) => ({
      ...prev,
      [addressType]: formattedAddress,
      pincode: pincode || prev.pincode,
    }));
  };

  useEffect(() => {
    if (scriptLoaded && window.google && window.google.maps && window.google.maps.places) {
      if (permAddressRef.current) {
        permAutocompleteRef.current = new window.google.maps.places.Autocomplete(permAddressRef.current, { types: ['geocode'] });
        permAutocompleteRef.current.setFields(['formatted_address', 'address_components', 'name']);
        permAutocompleteRef.current.addListener('place_changed', () => {
          const place = permAutocompleteRef.current.getPlace();
          parseAddressComponents(place, "permanentAddress");
        });
      }

      if (currAddressRef.current) {
        currAutocompleteRef.current = new window.google.maps.places.Autocomplete(currAddressRef.current, { types: ['geocode'] });
        currAutocompleteRef.current.setFields(['formatted_address', 'address_components', 'name']);
        currAutocompleteRef.current.addListener('place_changed', () => {
          const place = currAutocompleteRef.current.getPlace();
          parseAddressComponents(place, "currentAddress");
        });
      }

      return () => {
        if (permAutocompleteRef.current && window.google && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(permAutocompleteRef.current);
        }
        if (currAutocompleteRef.current && window.google && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(currAutocompleteRef.current);
        }
      };
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (!scriptLoaded || !window.google?.maps?.places) return;

    serviceAreaAutocompleteRefs.current = serviceAreaAddressRefs.current.map((input, index) => {
      if (!input) return null;

      const autocomplete = new window.google.maps.places.Autocomplete(input, { types: ["geocode"] });
      autocomplete.setFields(["formatted_address", "geometry"]);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const location = place.geometry?.location;
        if (!location) return;

        setFormData((previous) => ({
          ...previous,
          serviceArea: previous.serviceArea.map((area, areaIndex) =>
            areaIndex === index
              ? {
                  ...area,
                  address: place.formatted_address || place.name || area.address,
                  latitude: location.lat(),
                  longitude: location.lng(),
                }
              : area,
          ),
        }));
      });

      return autocomplete;
    });

    return () => {
      serviceAreaAutocompleteRefs.current.forEach((autocomplete) => {
        if (autocomplete && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete);
        }
      });
    };
  }, [scriptLoaded, formData.serviceArea.length]);

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
      gender: "",
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
      state: "",
      city: "",
      pincode: "",
      serviceArea: [],
      serviceRadius: "",
      vehiclePreferences: [],
      vehiclePreferenceCategories: [],
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
    if (!formData.state) errors.state = "State is required.";
    if (!formData.city) errors.city = "City is required.";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== null &&
          formData[key] !== undefined &&
          typeof formData[key] !== "object"
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.profilePic)
        formDataToSend.append("profilePic", formData.profilePic);
      if (formData.licensePhoto)
        formDataToSend.append("licensePhoto", formData.licensePhoto);
      if (formData.adhaarFrontPhoto)
        formDataToSend.append("adhaarFrontPhoto", formData.adhaarFrontPhoto);
      if (formData.adhaarBackPhoto)
        formDataToSend.append("adhaarBackPhoto", formData.adhaarBackPhoto);
      if (formData.panFrontPhoto)
        formDataToSend.append("panFrontPhoto", formData.panFrontPhoto);
      if (formData.panBackPhoto)
        formDataToSend.append("panBackPhoto", formData.panBackPhoto);
      if (formData.policeVerificationPhoto)
        formDataToSend.append(
          "policeVerificationPhoto",
          formData.policeVerificationPhoto,
        );
      formDataToSend.append(
        "vehiclePreferences",
        JSON.stringify(formData.vehiclePreferences),
      );

      formDataToSend.append(
        "vehiclePreferenceCategories",
        JSON.stringify(formData.vehiclePreferenceCategories),
      );
      formDataToSend.append("serviceArea", JSON.stringify(formData.serviceArea));
      formDataToSend.append("serviceRadius", formData.serviceRadius);

      const res = await createDriverApi(formDataToSend);

      if (res?.status) {
        toast.success("Driver created successfully!");
        navigate(-1);
      } else {
        const errorMsg = res?.message || "Failed to create Driver";
        toast.error(errorMsg);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Server error";
      console.error("Error creating Driver:", error);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <div>
        <Breaker />
      </div>

      <div className="card p-5 sm:p-8">
        <div className="mb-6 border-b border-slate-200/70 pb-5">
          <p className="section-label">Drivers</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Create Driver</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 md:grid-cols-2">
          <div>
            {/* Personal Info */}
            <label className="field-label">First Name *</label>
            <input
              className="field border"
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
            />
            {apiError.name && (
              <p className="field-error">{apiError.name}</p>
            )}
          </div>

          <div>
            {/* middle name */}
            <label className="field-label">Middle Name</label>
            <input
              className="field border"
              type="text"
              name="midName"
              placeholder="Enter middle name (optional)"
              value={formData.midName}
              onChange={handleChange}
            />
          </div>

          <div>
            {/* last name */}
            <label className="field-label">Last Name</label>
            <input
              className="field border"
              type="text"
              name="lastName"
              placeholder="Enter Last Name (optional)"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">Email</label>
            <input
              className="field border"
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">Phone Number *</label>
            <input
              className="field border"
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

            {apiError.phone && (
              <p className="field-error">{apiError.phone}</p>
            )}
          </div>

          <div>
            <label className="field-label">Alternate Phone</label>
            <input
              className={`field border ${
                apiError.alternatePhone ? "!border-rose-500" : "border-slate-200"
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
              <p className="field-error">
                {apiError.alternatePhone}
              </p>
            )}
          </div>

          <div>
            {/* gender */}
            <label className="field-label">Gender</label>
            <Select
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val })}
              className="w-full !h-10 [&_.ant-select-selector]:!rounded-lg"
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </div>

          <div>
            {/* state */}
            <label className="field-label">State</label>
            <select
              className="field border"
              name="state"
              value={formData.state}
              onChange={(event) => setFormData({ ...formData, state: event.target.value, city: "" })}
              disabled={statesLoading}
            >
              <option value="">{statesLoading ? "Loading states..." : "Select state"}</option>
              {states.map((state) => <option key={state._id} value={state.name}>{state.name}</option>)}
            </select>
            {apiError.state && <p className="field-error">{apiError.state}</p>}
          </div>

          <div>
            {/* city */}
            <label className="field-label">City</label>
            <select
              className="field border disabled:cursor-not-allowed disabled:bg-slate-100"
              name="city"
              value={formData.city}
              onChange={(event) => setFormData({ ...formData, city: event.target.value })}
              disabled={!formData.state || citiesLoading}
            >
              <option value="">{citiesLoading ? "Loading cities..." : formData.state ? "Select city" : "Select a state first"}</option>
              {cities.map((city) => <option key={city._id} value={city.name}>{city.name}</option>)}
            </select>
            {apiError.city && <p className="field-error">{apiError.city}</p>}
          </div>

          <div>
            {/* pincode */}
            <label className="field-label">Pincode</label>
            <input
              className="field border"
              type="text"
              name="pincode"
              placeholder="Enter pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="field-label">Service Radius (meters)</label>
            <input
              className="field border"
              type="number"
              name="serviceRadius"
              min="0"
              placeholder="Enter service radius"
              value={formData.serviceRadius}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <label className="field-label mb-0">Service Areas</label>
              <button
                type="button"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    serviceArea: [
                      ...previous.serviceArea,
                      { address: "", latitude: "", longitude: "" },
                    ],
                  }))
                }
              >
                Add service area
              </button>
            </div>
            <div className="space-y-3">
              {formData.serviceArea.map((area, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-4"
                >
                  <input
                    ref={(element) => {
                      serviceAreaAddressRefs.current[index] = element;
                    }}
                    className="field border sm:col-span-3"
                    type="text"
                    placeholder="Search service area address"
                    aria-label={`Service area ${index + 1} address`}
                    value={area.address}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        serviceArea: previous.serviceArea.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, address: event.target.value, latitude: "", longitude: "" }
                            : item,
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="rounded-lg px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    aria-label={`Remove service area ${index + 1}`}
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        serviceArea: previous.serviceArea.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">
              Permanent Address
            </label>
            <input
              ref={permAddressRef}
              className="field border"
              type="text"
              name="permanentAddress"
              placeholder="Search Permanent address"
              value={formData.permanentAddress}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">Current Address</label>
            <input
              ref={currAddressRef}
              className="field border"
              type="text"
              name="currentAddress"
              placeholder="Search Current address"
              value={formData.currentAddress}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">
              Vehicle Preferences
            </label>

            <Select
              mode="multiple"
              allowClear
              placeholder="Select vehicle preferences"
              value={formData.vehiclePreferences}
              onChange={(value) =>
                setFormData({ ...formData, vehiclePreferences: value })
              }
              className="w-full [&_.ant-select-selector]:!min-h-11 [&_.ant-select-selector]:!rounded-xl"
            >
              {vehiclePrefs.map((pref) => (
                <Option key={pref._id} value={pref._id}>
                  {pref.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="field-label">
              Vehicle Preference Categories
            </label>

            <Select
              mode="multiple"
              allowClear
              placeholder="Select categories"
              value={formData.vehiclePreferenceCategories}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  vehiclePreferenceCategories: value,
                })
              }
              className="w-full [&_.ant-select-selector]:!min-h-11 [&_.ant-select-selector]:!rounded-xl"
            >
              {vehicleCategories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            {/* License */}
            <label className="field-label">
              License Number *
            </label>
            <input
              className="field border"
              type="text"
              name="licenseNumber"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
            {apiError.licenseNumber && (
              <p className="field-error">
                {apiError.licenseNumber}
              </p>
            )}
          </div>

          <div>
            <label className="field-label">License Expiry</label>
            <input
              className="field border"
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">License Photo *</label>
            {previews.licensePhoto && (
              <img
                src={previews.licensePhoto}
                alt="License Preview"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="license-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
            {apiError.licensePhoto && (
              <p className="field-error">{apiError.licensePhoto}</p>
            )}
          </div>

          <div>
            {/* Aadhaar */}
            <label className="field-label">
              Aadhaar Number *
            </label>
            <input
              className="field border"
              type="text"
              name="adhaarNumber"
              placeholder="Enter Aadhaar number"
              maxLength={12}
              inputMode="numeric"
              value={formData.adhaarNumber}
              onChange={handleChange}
            />
            {apiError.adhaarNumber && (
              <p className="field-error">{apiError.adhaarNumber}</p>
            )}
          </div>

          <div>
            <label className="field-label">
              Aadhaar Front Photo *
            </label>
            {previews.adhaarFrontPhoto && (
              <img
                src={previews.adhaarFrontPhoto}
                alt="Aadhaar Front"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="adhaar-front-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
            {apiError.adhaarFrontPhoto && (
              <p className="field-error">
                {apiError.adhaarFrontPhoto}
              </p>
            )}
          </div>

          <div>
            <label className="field-label">
              Aadhaar Back Photo *
            </label>
            {previews.adhaarBackPhoto && (
              <img
                src={previews.adhaarBackPhoto}
                alt="Aadhaar Back"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="adhaar-back-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
            {apiError.adhaarBackPhoto && (
              <p className="field-error">
                {apiError.adhaarBackPhoto}
              </p>
            )}
          </div>

          <div>
            {/* PAN */}
            <label className="field-label">PAN Number *</label>
            <input
              className="field border"
              type="text"
              name="panNumber"
              placeholder="Enter PAN number"
              value={formData.panNumber}
              onChange={handleChange}
            />
            {apiError.panNumber && (
              <p className="field-error">{apiError.panNumber}</p>
            )}
          </div>

          <div>
            <label className="field-label">
              PAN Front Photo *
            </label>
            {previews.panFrontPhoto && (
              <img
                src={previews.panFrontPhoto}
                alt="PAN Front"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="pan-front-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
            {apiError.panFrontPhoto && (
              <p className="field-error">
                {apiError.panFrontPhoto}
              </p>
            )}
          </div>

          <div>
            <label className="field-label">
              PAN Back Photo *
            </label>
            {previews.panBackPhoto && (
              <img
                src={previews.panBackPhoto}
                alt="PAN Back"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="pan-back-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
            {apiError.panBackPhoto && (
              <p className="field-error">{apiError.panBackPhoto}</p>
            )}
          </div>

          <div>
            {/* Police Verification */}
            <label className="field-label">
              Police Verification Expiry
            </label>
            <input
              className="field border"
              type="date"
              name="policeVerificationExpiry"
              value={formData.policeVerificationExpiry}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">
              Police Verification Photo
            </label>
            {previews.policeVerificationPhoto && (
              <img
                src={previews.policeVerificationPhoto}
                alt="Police Verification"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="police-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
          </div>

          <div>
            {/* Profile Picture */}
            <label className="field-label">
              Profile Picture *
            </label>
            {previews.profilePic && (
              <img
                src={previews.profilePic}
                alt="Profile Preview"
                className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
              />
            )}
            <label
              htmlFor="profile-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
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
            {apiError.profilePic && (
              <p className="field-error">{apiError.profilePic}</p>
            )}
          </div>

          </div>

          {/* Status Toggles - Small & Professional */}
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-slate-900/[0.03] p-4 ring-1 ring-inset ring-slate-900/5 sm:grid-cols-3">
            <div>
              <label className="field-label">Is Verified</label>
              <Switch
                checked={formData.isVerified}
                onChange={(checked) =>
                  setFormData({ ...formData, isVerified: checked })
                }
                checkedChildren="Yes"
                unCheckedChildren="No"
                size="default" // normal/small size
              />
              {apiError.isVerified && (
                <p className="field-error">
                  {apiError.isVerified}
                </p>
              )}
            </div>

            <div>
              <label className="field-label">Is Online</label>
              <Switch
                checked={formData.isOnline}
                onChange={(checked) =>
                  setFormData({ ...formData, isOnline: checked })
                }
                checkedChildren="Online"
                unCheckedChildren="Offline"
                size="default"
              />
              {apiError.isOnline && (
                <p className="field-error">{apiError.isOnline}</p>
              )}
            </div>

            <div>
              <label className="field-label">Is Available</label>
              <Switch
                checked={formData.isAvailable}
                onChange={(checked) =>
                  setFormData({ ...formData, isAvailable: checked })
                }
                checkedChildren="Available"
                unCheckedChildren="Busy"
                size="default"
              />
              {apiError.isAvailable && (
                <p className="field-error">
                  {apiError.isAvailable}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            {/* CLEAR */}
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary w-full sm:w-auto"
            >
              Clear
            </button>

            {/* BACK */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto"
            >
              Back
            </button>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? "Creating..." : "Create Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDriver;
