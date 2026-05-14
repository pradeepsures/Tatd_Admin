import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Select } from "antd";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getEtsUserStopPagesByIdApi,
  updateEtsUserStopPagesApi,
} from "../../Services/EtsUserStopPages";

const { Option } = Select;

const UpdateEtsUserStoppage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [stoppages, setStoppages] = useState([]);

  const [formData, setFormData] = useState({
    user: {},
    route: {},
    boardingStoppage: {},
    droppingStoppage: {},
    isActive: true,
  });

  // ✅ FETCH DETAILS
  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getEtsUserStopPagesByIdApi(id);

      if (res?.status) {
        const data = res.data;

        setFormData({
          user: data.user,
          route: data.route,
          boardingStoppage: data.boardingStoppage,
          droppingStoppage: data.droppingStoppage,
          isActive: data.isActive,
        });

        // ✅ only route stoppages allowed
        setStoppages(data.route?.stoppages || []);
      }
    } catch {
      toast.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE STOPPAGE SELECT
  const handleStoppageSelect = (type, stoppageId) => {
    const stop = stoppages.find((s) => s._id === stoppageId);
    if (!stop) return;

    const data = {
      stoppageId: stop._id,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      address: stop.address,
      order: stop.order,
    };

    setFormData((prev) => ({
      ...prev,
      [type]: data,
    }));
  };

  // ✅ SUBMIT UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        boardingStoppage: formData.boardingStoppage,
        droppingStoppage: formData.droppingStoppage,
        isActive: formData.isActive,
      };

      const res = await updateEtsUserStopPagesApi(id, payload);

      if (res?.status) {
        toast.success("Updated successfully");
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      <div className="mt-6 bg-white p-6 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>

          {/* USER (READ ONLY) */}
          <div className="mt-4">
            <label className="block text-sm font-medium ml-1">
              User
            </label>
            <input
              value={`${formData.user?.name || ""} (${formData.user?.email || ""})`}
              readOnly
              className="border p-2 mt-1 w-full rounded-xl bg-gray-100"
            />
          </div>

          {/* ROUTE (READ ONLY) */}
          <div className="mt-4">
            <label className="block text-sm font-medium ml-1">
              Route
            </label>
            <input
              value={formData.route?.name || ""}
              readOnly
              className="border p-2 mt-1 w-full rounded-xl bg-gray-100"
            />
          </div>

          {/* BOARDING */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <label className="block text-sm font-medium">
              Boarding Stoppage
            </label>

            <Select
              value={formData.boardingStoppage?.stoppageId}
              size="large"
              className="w-full mt-2 custom-select"
              onChange={(val) =>
                handleStoppageSelect("boardingStoppage", val)
              }
            >
              {stoppages.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>

            {/* AUTO FILLED */}
              <label className="block mt-3 text-sm font-medium ml-1">Name</label>
            <input value={formData.boardingStoppage?.name || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
             <label className="block mt-3 text-sm font-medium ml-1">Latitude</label>
            <input value={formData.boardingStoppage?.lat || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
                <label className="block mt-3 text-sm font-medium ml-1">Longitude</label>
            <input value={formData.boardingStoppage?.lng || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
                <label className="block mt-3 text-sm font-medium ml-1">Address</label>
            <input value={formData.boardingStoppage?.address || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
          </div>

          {/* DROPPING */}
          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <label className="block text-sm font-medium">
              Dropping Stoppage
            </label>

            <Select
              value={formData.droppingStoppage?.stoppageId}
              size="large"
              className="w-full mt-2 custom-select"
              onChange={(val) =>
                handleStoppageSelect("droppingStoppage", val)
              }
            >
              {stoppages.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>

            {/* AUTO FILLED */}
                <label className="block mt-3 text-sm font-medium ml-1">Name</label>
            <input value={formData.droppingStoppage?.name || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
              <label className="block mt-3 text-sm font-medium ml-1">Latitude</label>
            <input value={formData.droppingStoppage?.lat || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
              <label className="block mt-3 text-sm font-medium ml-1">Longitude</label>
            <input value={formData.droppingStoppage?.lng || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
              <label className="block mt-3 text-sm font-medium ml-1">Address</label>
              
            <input value={formData.droppingStoppage?.address || ""} readOnly className="border p-2 mt-2 w-full rounded-xl" />
          </div>

          {/* STATUS */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Status
            </label>

            <div
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer ${
                formData.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full transition ${
                  formData.isActive ? "translate-x-7" : ""
                }`}
              />
            </div>

            <span
              className={`ml-2 text-sm ${
                formData.isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {formData.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">
            <button className=" bg-primary text-white py-3 px-6 rounded-2xl">
              Update
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

export default UpdateEtsUserStoppage;