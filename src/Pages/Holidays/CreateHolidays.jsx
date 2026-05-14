import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { createHolidayApi } from "../../Services/HolidaysApi";
import { getAllRegions } from "../../Services/RegionApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select, Switch } from "antd";

const { Option } = Select;

const CreateHolidays = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [regions, setRegions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    region: "",
    isActive: true,
  });

  // 🔹 Fetch Regions
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

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError({});

    const errors = {};
    if (!formData.name.trim()) errors.name = "Holiday name is required";
    if (!formData.date) errors.date = "Date is required";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await createHolidayApi(formData);

      if (res?.status) {
        toast.success("Holiday created successfully!");
        navigate(-1);
      } else {
        toast.error(res?.message || "Failed to create holiday");
      }
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Clear Form
  const handleClear = () => {
    setFormData({
      name: "",
      date: "",
      region: "",
      isActive: true,
    });
    setApiError({});
  };

  if (loading) return <Loader />;

  return (
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>

      <div className="ml-5 mt-8 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>

          {/* Holiday Name */}
          <label className="ml-2 mt-4 block">Holiday Name *</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            name="name"
            placeholder="Enter holiday name (e.g. Diwali)"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && <p className="text-red-500 text-sm ml-2">{apiError.name}</p>}

          {/* Date */}
          <label className="ml-2 mt-5 block">Date *</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
          {apiError.date && <p className="text-red-500 text-sm ml-2">{apiError.date}</p>}

          {/* Region */}
          <label className="ml-2 mt-5 block">Region</label>
          <Select
            value={formData.region}
            onChange={(val) => setFormData({ ...formData, region: val })}
            className="w-full h-10 mb-1"
            placeholder="Select Region (optional)"
            showSearch
            optionFilterProp="children"
          >
            {regions.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name} ({r.state})
              </Option>
            ))}
          </Select>

          {/* Status */}
          <div className="mt-6">
            <label className="ml-2 block">Status</label>
            <Switch
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">

            {/* Create */}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-3 px-6 rounded-2xl hover:scale-105 transition-transform"
            >
              {loading ? "Creating..." : "Create Holiday"}
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={handleClear}
              className=" bg-gray-500 text-white py-3 px-6 rounded-2xl hover:scale-105 transition-transform"
            >
              Clear
            </button>

            {/* Back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className=" bg-gray-500 text-white py-3 px-6 rounded-2xl hover:scale-105 transition-transform"
            >
              Back
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHolidays;