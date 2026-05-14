import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Switch } from "antd";

import {
  updatePunchRegionApi,
  getPunchRegionById,
} from "../../Services/PunchRegionApi";
import { getAllRegions } from "../../Services/RegionApi";

const UpdatePunchRegion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [apiError, setApiError] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    centerLat: "",
    centerLng: "",
    radiusMeters: 500,
    address: "",
    isActive: true,
  });

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchRegions();
    fetchDetails();
  }, [id]);

  // ✅ GET REGIONS
  const fetchRegions = async () => {
    try {
      const res = await getAllRegions({ page: 1, rowsPerPage: 100 });
      if (res?.status) setRegions(res.data || []);
    } catch {
      toast.error("Failed to load regions");
    }
  };

  // ✅ GET SINGLE DATA
  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getPunchRegionById(id);

      if (res?.status) {
        const d = res.data;

        setFormData({
          name: d.name || "",
          region: d.region?._id || "",
          centerLat: d.centerLat || "",
          centerLng: d.centerLng || "",
          radiusMeters: d.radiusMeters || 500,
          address: d.address || "",
          isActive: d.isActive ?? true,
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ UPDATE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.region) errors.region = "Region is required";
    if (!formData.centerLat) errors.centerLat = "Latitude required";
    if (!formData.centerLng) errors.centerLng = "Longitude required";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        centerLat: Number(formData.centerLat),
        centerLng: Number(formData.centerLng),
        radiusMeters: Number(formData.radiusMeters),
      };

      const res = await updatePunchRegionApi({
        id,
        data: payload,
      });

      if (res?.status) {
        toast.success("Punch Region updated successfully!");
        navigate(-1);
      } else {
        toast.error(res?.message || "Update failed");
      }

    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLEAR (RESET TO CURRENT DATA)
  const handleClear = () => {
    fetchDetails();
    setApiError({});
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
          <label className="ml-2 mt-4 block">Name *</label>
          <input
            className="w-full h-10 border rounded-xl pl-4 border-gray-500"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && (
            <p className="text-red-500 text-sm ml-2">{apiError.name}</p>
          )}

          {/* REGION */}
          <label className="ml-2 mt-5 block">Region *</label>
          <select
            className="w-full h-10 border rounded-xl pl-3 border-gray-500"
            name="region"
            value={formData.region}
            onChange={handleChange}
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.state})
              </option>
            ))}
          </select>
          {apiError.region && (
            <p className="text-red-500 text-sm ml-2">{apiError.region}</p>
          )}

          {/* LAT */}
          <label className="ml-2 mt-5 block">Center Latitude *</label>
          <input
            className="w-full h-10 border rounded-xl pl-4 border-gray-500"
            type="number"
            name="centerLat"
            value={formData.centerLat}
            onChange={handleChange}
          />

          {/* LNG */}
          <label className="ml-2 mt-5 block">Center Longitude *</label>
          <input
            className="w-full h-10 border rounded-xl pl-4 border-gray-500"
            type="number"
            name="centerLng"
            value={formData.centerLng}
            onChange={handleChange}
          />

          {/* RADIUS */}
          <label className="ml-2 mt-5 block">Radius (meters)</label>
          <input
            className="w-full h-10 border rounded-xl pl-4 border-gray-500"
            type="number"
            name="radiusMeters"
            value={formData.radiusMeters}
            onChange={handleChange}
          />

          {/* ADDRESS */}
          <label className="ml-2 mt-5 block">Address</label>
          <textarea
            className="w-full border rounded-xl p-3 border-gray-500"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          {/* STATUS */}
          <div className="mt-6">
            <label className="ml-2 block">Active Status</label>
            <Switch
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              type="submit"
              className="bg-primary text-white py-3 px-6 rounded-2xl"
            >
              {loading ? "Updating..." : "Update Punch Region"}
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

export default UpdatePunchRegion;