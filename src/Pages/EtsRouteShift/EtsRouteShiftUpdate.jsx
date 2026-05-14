import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select } from "antd";
const { Option } = Select;

import {
  getAllEtsRoutes,
} from "../../Services/EtsRouteApi";

import {
  getEtsRouteShiftById,
  updateEtsRouteShiftApi,
} from "../../Services/EtsRouteShift";

const UpdateEtsRouteShift = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routes, setRoutes] = useState([]);

  const [formData, setFormData] = useState({
    etsRoute: "",
    shiftName: "",
    price: "",
    gst: "",
    isActive: true,
    stoppageTimes: [],
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

  // ✅ FETCH SHIFT DATA (PREFILL)
  useEffect(() => {
    const fetchShift = async () => {
      try {
        setLoading(true);

        const res = await getEtsRouteShiftById(id);

        if (res?.status) {
          const data = res.data;

          setFormData({
            etsRoute: data.etsRoute?._id || "",
            shiftName: data.shiftName || "",
            price: data.price || "",
            gst: data.gst || "",
            isActive: data.isActive,
            stoppageTimes:
              data.stoppageTimes?.map((s) => ({
                name: s.name,
                lat: s.lat,
                lng: s.lng,
                address: s.address,
                order: s.order,
                distance: s.distance,
                arrivalTime: s.arrivalTime,
                departureTime: s.departureTime,
              })) || [],
          });
        }
      } catch {
        toast.error("Failed to load shift");
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [id]);

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

  // ✅ UPDATE SUBMIT
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

    if (formData.stoppageTimes.length < 2) {
      return toast.error("Minimum 2 stoppages required");
    }

    setLoading(true);

    try {
      const res = await updateEtsRouteShiftApi({
        id,
        data: formData,
      });

      if (res?.status) {
        toast.success("Updated successfully");
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
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
            size="large"
            placeholder="Select Route"
            value={formData.etsRoute || undefined}
            onChange={(value) =>
              setFormData({ ...formData, etsRoute: value })
            }
            optionFilterProp="children"
            className="w-full"
            loading={routeLoading}
          >
            {routes.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name}
              </Option>
            ))}
          </Select>

          {/* SHIFT NAME */}
          <label className="block mt-4 ml-2">Shift Name *</label>
          <input
            type="text"
            name="shiftName"
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

                <input name="name" placeholder="name" value={stop.name} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="address" placeholder="address" value={stop.address} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="lat"placeholder="lat" value={stop.lat} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="lng" placeholder="lng" value={stop.lng} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input name="distance" placeholder="distance" value={stop.distance} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input type="time" placeholder="arrival time" name="arrivalTime" value={stop.arrivalTime} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />
                <input type="time" placeholder="departure time" name="departureTime" value={stop.departureTime} onChange={(e) => handleStoppageChange(index, e)} className="border p-2" />

              </div>

            </div>
          ))}

          <button
            type="button"
            onClick={addStoppage}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            + Add Stoppage
          </button>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button type="submit" className="bg-primary text-white py-3 px-6 rounded-2xl">
              Update Shift
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

export default UpdateEtsRouteShift;