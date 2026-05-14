import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getAllEtsRoutes } from "../../Services/EtsRouteApi";
import { getAllEtsRouteShift } from "../../Services/EtsRouteShift";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";
import { createEtsRouteShiftAssignApi } from "../../Services/EtsRouteShiftaAssign";

const CreateEtsRouteShiftAssign = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [allVehicles, setAllVehicles] = useState([]); // 🔥 store all vehicles

  const [formData, setFormData] = useState({
    etsRoute: null,
    etsRouteShift: null,
    driver: null,
    vehicle: null,
    date: "",
  });

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      setLoading(true);

      const [routeRes, shiftRes, driverRes, vehicleRes] =
        await Promise.all([
          getAllEtsRoutes({ page: 1, rowsPerPage: 100 }),
          getAllEtsRouteShift({ page: 1, rowsPerPage: 100 }),
          getAllDrivers({ page: 1, rowsPerPage: 100, searchQuery: "" }),
          getAllVehicles({ page: 1, limit: 100 }),
        ]);

      setRoutes(
        routeRes?.data?.map((r) => ({
          value: r._id,
          label: r.name,
        })) || []
      );

      setShifts(
        shiftRes?.data?.map((s) => ({
          value: s._id,
          label: s.shiftName,
        })) || []
      );

      setDrivers(
        driverRes?.data?.map((d) => ({
          value: d._id,
          label: d.name || d.phone,
        })) || []
      );

      // 🔥 store full vehicles
      setAllVehicles(vehicleRes?.data || []);

    } catch {
      toast.error("Failed to load dropdown data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE SELECT
  const handleSelectChange = (name, selected) => {

    if (name === "driver") {
      // filter vehicles for selected driver
      const filteredVehicles = allVehicles.filter(
        // (v) => v.driver === selected.value
          (v) => String(v.driver?._id || v.driver) === String(selected.value)
      );

      const vehicleOptions = filteredVehicles.map((v) => ({
        value: v._id,
        label: `${v.brand || ""} - ${v.carNumber || ""}`,
      }));

      setVehicles(vehicleOptions);

      setFormData({
        ...formData,
        driver: selected,
        vehicle: null, // reset vehicle
      });

    } else {
      setFormData({
        ...formData,
        [name]: selected,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, date: e.target.value });
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.etsRoute ||
      !formData.etsRouteShift ||
      !formData.driver ||
      !formData.vehicle ||
      !formData.date
    ) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const payload = {
        etsRoute: formData.etsRoute.value,
        etsRouteShift: formData.etsRouteShift.value,
        driver: formData.driver.value,
        vehicle: formData.vehicle.value,
        date: formData.date,
      };

      const res = await createEtsRouteShiftAssignApi(payload);

      if (res?.status) {
        toast.success("Assigned successfully");
        navigate(-1);
      }

    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // ✅ STYLES
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#000",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      "&:hover": {
        borderColor: "#000",
      },
      minHeight: "44px",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      zIndex: 9999,
    }),
  };

  return (
    <div className="m-3">
      <Breaker />

      <div className="mt-6 bg-white p-6 w-full rounded-xl shadow-xl">

        <h2 className="text-xl font-semibold mb-6">
          Assign Route Shift
        </h2>

        <form onSubmit={handleSubmit}>

          {/* ROUTE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Select Route *</label>
            <Select
              options={routes}
              value={formData.etsRoute}
              onChange={(val) => handleSelectChange("etsRoute", val)}
              styles={customSelectStyles}
            />
          </div>

          {/* SHIFT */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Select Shift *</label>
            <Select
              options={shifts}
              value={formData.etsRouteShift}
              onChange={(val) => handleSelectChange("etsRouteShift", val)}
              styles={customSelectStyles}
            />
          </div>

          {/* 🔥 DRIVER FIRST */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Select Driver *</label>
            <Select
              options={drivers}
              value={formData.driver}
              onChange={(val) => handleSelectChange("driver", val)}
              styles={customSelectStyles}
            />
          </div>

          {/* 🔥 VEHICLE FILTERED */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Select Vehicle *</label>
            <Select
              options={vehicles}
              value={formData.vehicle}
              onChange={(val) => handleSelectChange("vehicle", val)}
              styles={customSelectStyles}
              isDisabled={!formData.driver} // disable until driver selected
              placeholder={
                formData.driver
                  ? "Select vehicle"
                  : "Select driver first"
              }
            />
          </div>

          {/* DATE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Select Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full h-11 border border-black rounded-xl px-3 
                         focus:outline-none focus:ring-1 focus:ring-black 
                         hover:border-black"
              required
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              type="submit"
              className="bg-primary text-white py-3 px-6 rounded-2xl hover:bg-gray-900"
            >
              Assign
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className=" bg-gray-600 text-white py-3 px-6 rounded-2xl hover:bg-gray-700"
            >
              Back
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEtsRouteShiftAssign;