import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import {
  updateHolidayApi,
  getHolidayById,
} from "../../Services/HolidaysApi";
import { getAllRegions } from "../../Services/RegionApi";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { Select, Switch } from "antd";

const { Option } = Select;

const UpdateHoliday = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ get id from URL

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [regions, setRegions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    region: "",
    isActive: true,
  });

  // ✅ FETCH REGION LIST
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await getAllRegions({ page: 1, rowsPerPage: 100 });
        if (res?.status) setRegions(res.data || []);
      } catch {
        toast.error("Failed to load regions");
      }
    };

    fetchRegions();
  }, []);

  // ✅ FETCH SINGLE HOLIDAY (PREFILL)
  useEffect(() => {
    const fetchHoliday = async () => {
      try {
        setLoading(true);

        const res = await getHolidayById(id);

        if (res?.status) {
          const data = res.data;

          setFormData({
            name: data.name || "",
            date: data.date ? data.date.split("T")[0] : "", // ✅ fix date format
            region: data?.region?._id || "", // ✅ prefill region
            isActive: data.isActive ?? true,
          });
        }
      } catch {
        toast.error("Failed to load holiday");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHoliday();
  }, [id]);

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ SUBMIT UPDATE
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
      const res = await updateHolidayApi({
        id,
        data: formData,
      });

      if (res?.status) {
        toast.success("Holiday updated successfully!");
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

  // ✅ CLEAR
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

          {/* NAME */}
          <label className="ml-2 mt-4 block">Holiday Name *</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && <p className="text-red-500 text-sm ml-2">{apiError.name}</p>}

          {/* DATE */}
          <label className="ml-2 mt-5 block">Date *</label>
          <input
            className="w-full h-10 mb-1 border rounded-xl pl-4 border-gray-500"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
          {apiError.date && <p className="text-red-500 text-sm ml-2">{apiError.date}</p>}

          {/* REGION */}
          <label className="ml-2 mt-5 block">Region</label>
          <Select
            value={formData.region || undefined}
            onChange={(val) =>
              setFormData({ ...formData, region: val })
            }
            className="w-full mb-1 custom-select"
            placeholder="Select Region"
            showSearch
          >
            {regions.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name} ({r.state})
              </Option>
            ))}
          </Select>

          {/* STATUS */}
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

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              type="submit"
              className="bg-primary text-white py-3 px-6 rounded-2xl"
            >
              Update Holiday
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

export default UpdateHoliday;