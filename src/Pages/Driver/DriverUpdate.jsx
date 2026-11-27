import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { getSingleDriver, updateDriver } from "../../Services/DriverApi";
import { getAllVehiclePreferences } from "../../Services/VehiclePreferenceApi";
import { getAllVehiclePreferenceCategories } from "../../Services/VehiclePreferenceCategoryApi";
import useLocationOptions from "../../hooks/useLocationOptions";
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

  const [vehiclePrefs, setVehiclePrefs] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);

  const permAddressRef = useRef(null);
  const currAddressRef = useRef(null);
  const permAutocompleteRef = useRef(null);
  const currAutocompleteRef = useRef(null);
  const serviceAreaAddressRefs = useRef([]);
  const serviceAreaAutocompleteRefs = useRef([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const stateResolved = useRef(false);
  const cityResolved = useRef(false);

  // Form state - same structure as create
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

  useEffect(() => {
    if (pageLoading || statesLoading || !states.length || stateResolved.current) return;
    const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");
    const savedState = normalize(formData.state);
    const savedLocation = normalize(
      [formData.city, formData.currentAddress, formData.permanentAddress].filter(Boolean).join(" ")
    );
    const matchedState = states.find((state) => {
      const masterName = normalize(state.name);
      return masterName === savedState || (masterName.length > 2 && savedLocation.includes(masterName));
    });
    stateResolved.current = true;
    setFormData((previous) => ({
      ...previous,
      state: matchedState?.name || "",
      city: matchedState ? previous.city : "",
    }));
  }, [pageLoading, statesLoading, states, formData.state, formData.city]);

  useEffect(() => {
    if (pageLoading || !formData.state || citiesLoading || !cities.length || cityResolved.current) return;
    const savedLocation = [formData.city, formData.currentAddress, formData.permanentAddress]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    const matchedCity = cities.find((city) => {
      const masterName = city.name.toLowerCase().replace(/[^a-z]/g, "");
      return masterName === savedLocation || (masterName.length > 2 && savedLocation.includes(masterName));
    });
    cityResolved.current = true;
    if (matchedCity) setFormData((previous) => ({ ...previous, city: matchedCity.name }));
    else setFormData((previous) => ({ ...previous, city: "" }));
  }, [pageLoading, formData.state, formData.city, citiesLoading, cities]);

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

  // Fetch dropdown options + single driver data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);

        // 1. Fetch dropdown options
        const prefsRes = await getAllVehiclePreferences({});
        const catsRes = await getAllVehiclePreferenceCategories({});
        setVehiclePrefs(prefsRes?.data || []);
        setVehicleCategories(catsRes?.data || []);

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
            gender: driver.gender || "",
            permanentAddress: driver.permanentAddress || "",
            currentAddress: driver.currentAddress || "",
            licenseNumber: driver.licenseNumber || "",
            licenseExpiry: driver.licenseExpiry
              ? new Date(driver.licenseExpiry).toISOString().split("T")[0]
              : "",
            adhaarNumber: driver.adhaarNumber || "",
            panNumber: driver.panNumber || "",
            policeVerificationExpiry: driver.policeVerificationExpiry
              ? new Date(driver.policeVerificationExpiry)
                  .toISOString()
                  .split("T")[0]
              : "",
            isVerified: driver.isVerified || false,
            isOnline: driver.isOnline || false,
            isAvailable: driver.isAvailable || false,
            state: driver.state || "",
            city: driver.city || "",
            pincode: driver.pincode || "",
            serviceArea: Array.isArray(driver.serviceArea)
              ? driver.serviceArea.map((area) => ({
                  address: area.address || "",
                  latitude: area.latitude ?? "",
                  longitude: area.longitude ?? "",
                }))
              : [],
            serviceRadius: driver.serviceRadius ?? "",
            vehiclePreferences:
              driver.vechiclePreferenceSchema?.map((p) => p._id) || [],

            vehiclePreferenceCategories:
              driver.VehiclePreferenceCategory?.map((c) => c._id) || [],
            // vehiclePreferences: driver.vehiclePreferences || [],
            // vehiclePreferenceCategories:
            //   driver.vehiclePreferenceCategories || [],
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
          toast.error("Driver not found");
          navigate(-1);
        }
      } catch (err) {
        toast.error("Failed to load Driver data");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setApiError((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
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
    if (!formData.state) errors.state = "State is required.";
    if (!formData.city) errors.city = "City is required.";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError || "Please complete the required fields.");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Text and boolean fields
      const fieldsToAppend = [
        "name",
        "midName",
        "lastName",
        "email",
        "phone",
        "alternatePhone",
        "gender",
        "permanentAddress",
        "currentAddress",
        "licenseNumber",
        "licenseExpiry",
        "adhaarNumber",
        "panNumber",
        "policeVerificationExpiry",
        "isVerified",
        "isOnline",
        "isAvailable",
        "state",
        "city",
        "pincode",
      ];

      fieldsToAppend.forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.profilePic instanceof File) {
        formDataToSend.append("profilePic", formData.profilePic);
      }
      if (formData.licensePhoto instanceof File) {
        formDataToSend.append("licensePhoto", formData.licensePhoto);
      }
      if (formData.adhaarFrontPhoto instanceof File) {
        formDataToSend.append("adhaarFrontPhoto", formData.adhaarFrontPhoto);
      }
      if (formData.adhaarBackPhoto instanceof File) {
        formDataToSend.append("adhaarBackPhoto", formData.adhaarBackPhoto);
      }
      if (formData.panFrontPhoto instanceof File) {
        formDataToSend.append("panFrontPhoto", formData.panFrontPhoto);
      }
      if (formData.panBackPhoto instanceof File) {
        formDataToSend.append("panBackPhoto", formData.panBackPhoto);
      }
      if (formData.policeVerificationPhoto instanceof File) {
        formDataToSend.append(
          "policeVerificationPhoto",
          formData.policeVerificationPhoto,
        );
      }

      formDataToSend.append(
        "vehiclePreferences",
        JSON.stringify(formData.vehiclePreferences || []),
      );
      formDataToSend.append(
        "vehiclePreferenceCategories",
        JSON.stringify(formData.vehiclePreferenceCategories || []),
      );
      formDataToSend.append("serviceArea", JSON.stringify(formData.serviceArea));
      formDataToSend.append("serviceRadius", formData.serviceRadius);

      const res = await updateDriver(id, formDataToSend);

      if (res?.status) {
        toast.success("Driver updated successfully!");
        navigate(-1);
      } else {
        toast.error(res?.message || "Failed to update Driver");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Server error";
      console.error("Error updating Driver:", error);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Loader />;
  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <div>
        <Breaker />
      </div>

      <div className="card p-5 sm:p-8">
        <div className="mb-6 border-b border-slate-200/70 pb-5">
          <p className="section-label">Drivers</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Update Driver</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 md:grid-cols-2">
          <div>
            {/* Personal Info */}
            <label className="field-label">Full Name *</label>
            <input
              className={`field border ${apiError.name ? "!border-rose-500" : "border-slate-200"}`}
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
            <label className="field-label">Last Name</label>
            <input
              className="field border"
              type="text"
              name="lastName"
              placeholder="Enter last name (optional)"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">Email *</label>
            <input
              className={`field border ${apiError.email ? "!border-rose-500" : "border-slate-200"}`}
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
            {apiError.email && <p className="field-error">{apiError.email}</p>}
          </div>

          <div>
            <label className="field-label">Phone Number *</label>
            <input
              className={`field border ${apiError.phone ? "!border-rose-500" : "border-slate-200"}`}
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData((previous) => ({ ...previous, phone: value }));
                setApiError((previous) => ({ ...previous, phone: "" }));
              }}
            />
            {apiError.phone && (
              <p className="field-error">{apiError.phone}</p>
            )}
          </div>

          <div>
            <label className="field-label">Alternate Phone</label>
            <input
              className="field border"
              type="tel"
              name="alternatePhone"
              placeholder="Alternate phone (optional)"
              value={formData.alternatePhone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">Gender</label>
            <Select
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val })}
              className="w-full !h-10 [&_.ant-select-selector]:!rounded-lg"
              placeholder="Select gender"
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </div>

          <div>
            {/* state */}
            <label className="field-label">State <span className="text-rose-600">*</span></label>
            <select
              className={`field border ${apiError.state ? "!border-rose-500" : "border-slate-200"}`}
              name="state"
              value={formData.state}
              onChange={(event) => {
                stateResolved.current = true;
                cityResolved.current = true;
                setApiError((previous) => ({ ...previous, state: "", city: "" }));
                setFormData({ ...formData, state: event.target.value, city: "" });
              }}
              disabled={statesLoading}
            >
              <option value="">{statesLoading ? "Loading states..." : "Select state"}</option>
              {states.map((state) => <option key={state._id} value={state.name}>{state.name}</option>)}
            </select>
            {apiError.state && <p className="field-error">{apiError.state}</p>}
          </div>

          <div>
            {/* city */}
            <label className="field-label">City <span className="text-rose-600">*</span></label>
            <select
              className={`field border disabled:cursor-not-allowed disabled:bg-slate-100 ${apiError.city ? "!border-rose-500" : "border-slate-200"}`}
              name="city"
              value={formData.city}
              onChange={(event) => {
                cityResolved.current = true;
                setApiError((previous) => ({ ...previous, city: "" }));
                setFormData({ ...formData, city: event.target.value });
              }}
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
              maxLength={6}
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
            {/* Addresses */}
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
            <div className="mb-2">
              {previews.licensePhoto ? (
                <img
                  src={previews.licensePhoto}
                  alt="New License Preview"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.licensePhoto ? (
                <img
                  src={existingImages.licensePhoto}
                  alt="Current License"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="license-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️{" "}
              {previews.licensePhoto
                ? "Replace License Photo"
                : "Upload / Replace License Photo"}
            </label>
            <input
              id="license-upload"
              className="hidden"
              type="file"
              name="licensePhoto"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            {/* Aadhaar, PAN, Police Verification, Profile Pic - same pattern */}

            <label className="field-label">
              Aadhaar Number *
            </label>
            <input
              className="field border"
              type="text"
              name="adhaarNumber"
              placeholder="Enter Aadhaar number"
              value={formData.adhaarNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="field-label">
              Aadhaar Front Photo *
            </label>
            <div className="mb-2">
              {previews.adhaarFrontPhoto ? (
                <img
                  src={previews.adhaarFrontPhoto}
                  alt="New Aadhaar Front"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.adhaarFrontPhoto ? (
                <img
                  src={existingImages.adhaarFrontPhoto}
                  alt="Current Aadhaar Front"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="adhaar-front-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️ {previews.adhaarFrontPhoto ? "Replace" : "Upload / Replace"}{" "}
              Aadhaar Front
            </label>
            <input
              id="adhaar-front-upload"
              className="hidden"
              type="file"
              name="adhaarFrontPhoto"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            {/* Aadhaar Back Photo */}
            <label className="field-label">
              Aadhaar Back Photo *
            </label>
            <div className="mb-2">
              {previews.adhaarBackPhoto ? (
                <img
                  src={previews.adhaarBackPhoto}
                  alt="New Aadhaar Back"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.adhaarBackPhoto ? (
                <img
                  src={existingImages.adhaarBackPhoto}
                  alt="Current Aadhaar Back"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="adhaar-back-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️{" "}
              {previews.adhaarBackPhoto
                ? "Replace Aadhaar Back"
                : "Upload / Replace Aadhaar Back"}
            </label>
            <input
              id="adhaar-back-upload"
              className="hidden"
              type="file"
              name="adhaarBackPhoto"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            {/* PAN Number */}
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
            {/* PAN Front Photo */}
            <label className="field-label">
              PAN Front Photo *
            </label>
            <div className="mb-2">
              {previews.panFrontPhoto ? (
                <img
                  src={previews.panFrontPhoto}
                  alt="New PAN Front"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.panFrontPhoto ? (
                <img
                  src={existingImages.panFrontPhoto}
                  alt="Current PAN Front"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="pan-front-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️{" "}
              {previews.panFrontPhoto
                ? "Replace PAN Front"
                : "Upload / Replace PAN Front"}
            </label>
            <input
              id="pan-front-upload"
              className="hidden"
              type="file"
              name="panFrontPhoto"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            {/* PAN Back Photo */}
            <label className="field-label">
              PAN Back Photo *
            </label>
            <div className="mb-2">
              {previews.panBackPhoto ? (
                <img
                  src={previews.panBackPhoto}
                  alt="New PAN Back"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.panBackPhoto ? (
                <img
                  src={existingImages.panBackPhoto}
                  alt="Current PAN Back"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="pan-back-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️{" "}
              {previews.panBackPhoto
                ? "Replace PAN Back"
                : "Upload / Replace PAN Back"}
            </label>
            <input
              id="pan-back-upload"
              className="hidden"
              type="file"
              name="panBackPhoto"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            {/* Police Verification Expiry */}
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
            {/* Police Verification Photo */}
            <label className="field-label">
              Police Verification Photo
            </label>
            <div className="mb-2">
              {previews.policeVerificationPhoto ? (
                <img
                  src={previews.policeVerificationPhoto}
                  alt="New Police Verification"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.policeVerificationPhoto ? (
                <img
                  src={existingImages.policeVerificationPhoto}
                  alt="Current Police Verification"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="police-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️{" "}
              {previews.policeVerificationPhoto
                ? "Replace Police Verification"
                : "Upload / Replace Police Verification"}
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
            <div className="mb-2">
              {previews.profilePic ? (
                <img
                  src={previews.profilePic}
                  alt="New Profile Preview"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : existingImages.profilePic ? (
                <img
                  src={existingImages.profilePic}
                  alt="Current Profile"
                  className="mb-2 h-16 w-24 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                />
              ) : null}
            </div>
            <label
              htmlFor="profile-upload"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm font-semibold text-slate-600 transition-colors hover:border-gray-400 hover:bg-white hover:text-slate-900"
            >
              🖼️{" "}
              {previews.profilePic
                ? "Replace Profile Picture"
                : "Upload / Replace Profile Picture"}
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

          {/* Status Toggles */}
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
                size="default"
              />
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
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? "Updating Driver..." : "Update Driver"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto"
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
