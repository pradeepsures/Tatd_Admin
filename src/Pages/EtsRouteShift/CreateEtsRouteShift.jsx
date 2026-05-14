import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select } from "antd";
const { Option } = Select;

import { getAllEtsRoutes, getEtsRouteById } from "../../Services/EtsRouteApi";
import { createEtsRouteShiftApi } from "../../Services/EtsRouteShift";

const CreateEtsRouteShift = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);

  const [formData, setFormData] = useState({
    etsRoute: "",
    shiftName: "",
    price: "",
    gst: "",
    isActive: true,
    stoppageTimes: [
      {
        name: "",
        lat: "",
        lng: "",
        address: "",
        order: 1,
        distance: "",
        arrivalTime: "",
        departureTime: "",
      },
    ],
  });

  // ✅ FETCH ROUTES
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setRouteLoading(true);
        const res = await getAllEtsRoutes({ page: 1, rowsPerPage: 100 });

        if (res?.status) {
          setRoutes(res.data);
        }
      } catch {
        toast.error("Failed to load routes");
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // ✅ AUTO FILL STOPPAGES WHEN ROUTE SELECTED
  const handleRouteChange = async (id) => {
    try {
      setFormData((prev) => ({ ...prev, etsRoute: id }));

      const res = await getEtsRouteById(id);

      if (res?.status) {
        const stops = res.data.stoppages.map((s, index) => ({
          name: s.name,
          lat: s.lat,
          lng: s.lng,
          address: s.address,
          order: index + 1,
          distance: s.distance || "",
          arrivalTime: "",
          departureTime: "",
        }));

        setFormData((prev) => ({
          ...prev,
          etsRoute: id,
          stoppageTimes: stops,
        }));
      }
    } catch {
      toast.error("Failed to load route details");
    }
  };

  // ✅ INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ STOPPAGE CHANGE
  const handleStoppageChange = (index, e) => {
    const { name, value } = e.target;

    const updated = [...formData.stoppageTimes];
    updated[index][name] = value;

    setFormData({ ...formData, stoppageTimes: updated });
  };

  // ✅ ADD STOPPAGE
  const addStoppage = () => {
    setFormData({
      ...formData,
      stoppageTimes: [
        ...formData.stoppageTimes,
        {
          name: "",
          lat: "",
          lng: "",
          address: "",
          order: formData.stoppageTimes.length + 1,
          distance: "",
          arrivalTime: "",
          departureTime: "",
        },
      ],
    });
  };

  // ✅ REMOVE STOPPAGE
  const removeStoppage = (index) => {
    const updated = formData.stoppageTimes.filter((_, i) => i !== index);

    const reordered = updated.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    setFormData({ ...formData, stoppageTimes: reordered });
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.etsRoute) {
      return toast.error("Please select route");
    }

    if (!formData.shiftName.trim()) {
      return toast.error("Shift name is required");
    }

    if (!formData.price) {
      return toast.error("Price is required");
    }

    if (!formData.stoppageTimes || formData.stoppageTimes.length < 2) {
      return toast.error("Minimum 2 stoppages required");
    }

    for (let i = 0; i < formData.stoppageTimes.length; i++) {
      const s = formData.stoppageTimes[i];

      if (!s.name || !s.lat || !s.lng || !s.address) {
        return toast.error(`Fill all fields for stoppage ${i + 1}`);
      }

      if (!s.arrivalTime || !s.departureTime) {
        return toast.error(
          `Add arrival & departure time for stoppage ${i + 1}`
        );
      }
    }

    setLoading(true);

    try {
      const res = await createEtsRouteShiftApi(formData);

      if (res?.status) {
        toast.success("Route Shift created successfully");
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLEAR
  const handleClear = () => {
    setFormData({
      etsRoute: "",
      shiftName: "",
      price: "",
      gst: "",
      isActive: true,
      stoppageTimes: [
        {
          name: "",
          lat: "",
          lng: "",
          address: "",
          order: 1,
          distance: "",
          arrivalTime: "",
          departureTime: "",
        },
      ],
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="m-3">
      <Breaker />

      <div className="mt-6 bg-white p-6 w-full rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>

          {/* ROUTE SELECT */}
          <label className="block mt-2 ml-2">Select Route *</label>
          <Select
            showSearch
            allowClear
            size="large"
            placeholder="Select Route"
            value={formData.etsRoute || undefined}
            onChange={handleRouteChange}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children
                ?.toLowerCase()
                ?.includes(input.toLowerCase())
            }
            loading={routeLoading}
            className="w-full custom-select"
          >
            {routes.map((r) => (
              <Option key={r._id} value={String(r._id)}>
                {r.name}
              </Option>
            ))}
          </Select>

          {/* SHIFT NAME */}
          <label className="block mt-4 ml-2">Shift Name *</label>
          <input
            type="text"
            name="shiftName"
            placeholder="Morning / Evening"
            value={formData.shiftName}
            onChange={handleChange}
            className="w-full h-10 border rounded-xl pl-4"
          />

          {/* PRICE */}
          <label className="block mt-4 ml-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full h-10 border rounded-xl pl-4"
          />

          {/* GST */}
          <label className="block mt-4 ml-2">GST (%)</label>
          <input
            type="number"
            name="gst"
            value={formData.gst}
            onChange={handleChange}
            className="w-full h-10 border rounded-xl pl-4"
          />

          {/* STATUS */}
          <label className="block mt-4 ml-2">Status</label>
          <select
            name="isActive"
            value={formData.isActive}
            onChange={(e) =>
              setFormData({
                ...formData,
                isActive: e.target.value === "true",
              })
            }
            className="w-full h-10 border rounded-xl pl-3"
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>

          {/* STOPPAGES */}
          <h3 className="mt-6 text-lg font-semibold">Stoppage Timings</h3>

          {formData.stoppageTimes.map((stop, index) => (
            <div key={index} className="border p-4 mt-4 rounded-xl bg-gray-50">
              <div className="flex justify-between">
                <h4>Stoppage #{index + 1}</h4>
                {formData.stoppageTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStoppage(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <input name="name" placeholder="Name" value={stop.name} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="address" placeholder="Address" value={stop.address} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="lat" placeholder="Lat" value={stop.lat} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="lng" placeholder="Lng" value={stop.lng} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="distance" placeholder="Distance" value={stop.distance} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input type="time" name="arrivalTime" value={stop.arrivalTime} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input type="time" name="departureTime" value={stop.departureTime} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
              </div>
            </div>
          ))}

          <button type="button" onClick={addStoppage} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
            + Add Stoppage
          </button>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">
            <button type="submit" className=" bg-primary text-white py-3 px-6 rounded-2xl">
              Create Shift
            </button>

            <button type="button" onClick={handleClear} className=" bg-gray-500 text-white py-3 px-6 rounded-2xl">
              Clear
            </button>

            <button type="button" onClick={() => navigate(-1)} className=" bg-gray-500 text-white py-3 px-6 rounded-2xl">
              Back
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEtsRouteShift;