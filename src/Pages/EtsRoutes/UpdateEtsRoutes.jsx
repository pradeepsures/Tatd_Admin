import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import {
  getEtsRouteById,
  updateEtsRouteApi,
} from "../../Services/EtsRouteApi";

const UpdateEtsRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    stoppages: [],
  });

  // ✅ FETCH DATA (PREFILL)
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);

        const res = await getEtsRouteById(id);

        if (res?.status) {
          setFormData({
            name: res.data.name || "",
            isActive: res.data.isActive ?? true,
            stoppages:
              res.data.stoppages?.map((s, i) => ({
                name: s.name || "",
                lat: s.lat || "",
                lng: s.lng || "",
                address: s.address || "",
                order: i + 1,
                distance: s.distance || "",
                isActive: s.isActive ?? true,
              })) || [],
          });
        }
      } catch (err) {
        toast.error("Failed to load route");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  // ✅ ROUTE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ STOPPAGE CHANGE
  const handleStoppageChange = (index, e) => {
    const { name, value } = e.target;

    const updated = [...formData.stoppages];
    updated[index][name] = value;

    setFormData({ ...formData, stoppages: updated });
  };

  // ✅ ADD STOPPAGE
  const addStoppage = () => {
    setFormData({
      ...formData,
      stoppages: [
        ...formData.stoppages,
        {
          name: "",
          lat: "",
          lng: "",
          address: "",
          order: formData.stoppages.length + 1,
          distance: "",
          isActive: true,
        },
      ],
    });
  };

  // ✅ REMOVE STOPPAGE
  const removeStoppage = (index) => {
    const updated = formData.stoppages.filter((_, i) => i !== index);

    const reordered = updated.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    setFormData({ ...formData, stoppages: reordered });
  };

  // ✅ UPDATE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDATION
    if (!formData.name.trim()) {
      return toast.error("Route name is required");
    }

    if (!formData.stoppages || formData.stoppages.length < 2) {
      return toast.error("Minimum 2 stoppages required");
    }

    setLoading(true);

    try {
      const res = await updateEtsRouteApi({
        id,
        data: formData,
      });

      if (res?.status) {
        toast.success("Route updated successfully");
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLEAR
  const handleClear = () => {
    setFormData({
      name: "",
      isActive: true,
      stoppages: [
        {
          name: "",
          lat: "",
          lng: "",
          address: "",
          order: 1,
          distance: "",
          isActive: true,
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

          {/* ROUTE NAME */}
          <label className="block mt-2 ml-2">Route Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter route name"
            value={formData.name}
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
          <h3 className="mt-6 text-lg font-semibold">Stoppages</h3>

          {formData.stoppages.map((stop, index) => (
            <div key={index} className="border p-4 mt-4 rounded-xl bg-gray-50">

              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">
                  Stoppage #{index + 1}
                </h4>

                {formData.stoppages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStoppage(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">

                <input
                  type="text"
                  name="name"
                  placeholder="Stop Name"
                  value={stop.name}
                  onChange={(e) => handleStoppageChange(index, e)}
                  className="border rounded-lg p-2"
                />

                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={stop.address}
                  onChange={(e) => handleStoppageChange(index, e)}
                  className="border rounded-lg p-2"
                />

                <input
                  type="number"
                  name="lat"
                  placeholder="Latitude"
                  value={stop.lat}
                  onChange={(e) => handleStoppageChange(index, e)}
                  className="border rounded-lg p-2"
                />

                <input
                  type="number"
                  name="lng"
                  placeholder="Longitude"
                  value={stop.lng}
                  onChange={(e) => handleStoppageChange(index, e)}
                  className="border rounded-lg p-2"
                />

                <input
                  type="number"
                  name="distance"
                  placeholder="Distance"
                  value={stop.distance}
                  onChange={(e) => handleStoppageChange(index, e)}
                  className="border rounded-lg p-2"
                />

                <input
                  type="number"
                  name="order"
                  placeholder="Order"
                  value={stop.order}
                  onChange={(e) => handleStoppageChange(index, e)}
                  className="border rounded-lg p-2"
                />

                <select
                  name="isActive"
                  value={stop.isActive}
                  onChange={(e) =>
                    handleStoppageChange(index, {
                      target: {
                        name: "isActive",
                        value: e.target.value === "true",
                      },
                    })
                  }
                  className="border rounded-lg p-2"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>

              </div>
            </div>
          ))}

          {/* ADD STOPPAGE */}
          <button
            type="button"
            onClick={addStoppage}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            + Add Stoppage
          </button>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              type="submit"
              className="bg-primary text-white py-3 px-6 rounded-2xl"
            >
              Update Route
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

export default UpdateEtsRoute;