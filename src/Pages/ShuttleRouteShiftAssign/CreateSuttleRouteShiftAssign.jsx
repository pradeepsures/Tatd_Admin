import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getAllShuttleRoutes } from "../../Services/ShuttleRouteApi";
import { getAllShuttleRouteShifts } from "../../Services/SuttleRouteShiftApi";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";
import { createShuttleRouteShiftAssignApi } from "../../Services/ShuttleRouteShiftAssignApi";

const CreateShuttleRouteShiftAssign = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [allVehicles, setAllVehicles] = useState([]);

  const [formData, setFormData] = useState({
    shuttleRoute: null,
    shuttleRouteShift: null,
    driver: null,
    vehicle: null,
    date: "",
  });

  // ✅ FETCH DROPDOWN DATA
  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      setLoading(true);

      const [routeRes, shiftRes, driverRes, vehicleRes] =
        await Promise.all([
          getAllShuttleRoutes({ page: 1, rowsPerPage: 100 }),
          getAllShuttleRouteShifts({ page: 1, rowsPerPage: 100 }),
          getAllDrivers({ page: 1, rowsPerPage: 100, searchQuery: "" }),
          getAllVehicles({ page: 1, limit: 100 }),
        ]);

      // ROUTES
      setRoutes(
        routeRes?.data?.map((r) => ({
          value: r._id,
          label: r.name,
        })) || []
      );

      // SHIFTS
      setShifts(
        shiftRes?.data?.map((s) => ({
          value: s._id,
          label: s.shiftName,
        })) || []
      );

      // DRIVERS
      setDrivers(
        driverRes?.data?.map((d) => ({
          value: d._id,
          label: d.name || d.phone,
        })) || []
      );

      // ALL VEHICLES
      setAllVehicles(vehicleRes?.data || []);

    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE SELECT
  const handleSelectChange = (name, selected) => {

    if (name === "driver") {
      // filter vehicles based on driver
      const filtered = allVehicles.filter(
        (v) =>
          String(v.driver?._id || v.driver) === String(selected.value)
      );

      const vehicleOptions = filtered.map((v) => ({
        value: v._id,
        label: `${v.brand || ""} - ${v.carNumber || ""}`,
      }));

      setVehicles(vehicleOptions);

      setFormData({
        ...formData,
        driver: selected,
        vehicle: null,
      });

    } else {
      setFormData({
        ...formData,
        [name]: selected,
      });
    }
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, date: e.target.value });
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.shuttleRoute ||
      !formData.shuttleRouteShift ||
      !formData.driver ||
      !formData.vehicle ||
      !formData.date
    ) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const payload = {
        shuttleRoute: formData.shuttleRoute.value,
        shuttleRouteShift: formData.shuttleRouteShift.value,
        driver: formData.driver.value,
        vehicle: formData.vehicle.value,
        date: formData.date,
      };

      const res = await createShuttleRouteShiftAssignApi(payload);

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

  // ✅ REACT-SELECT STYLE
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#000",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      "&:hover": { borderColor: "#000" },
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
          Shuttle Route Shift Assign
        </h2>

        <form onSubmit={handleSubmit}>

          {/* ROUTE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Route *</label>
            <Select
              options={routes}
              value={formData.shuttleRoute}
              onChange={(val) => handleSelectChange("shuttleRoute", val)}
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          {/* SHIFT */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Shift *</label>
            <Select
              options={shifts}
              value={formData.shuttleRouteShift}
              onChange={(val) => handleSelectChange("shuttleRouteShift", val)}
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          {/* DRIVER */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Driver *</label>
            <Select
              options={drivers}
              value={formData.driver}
              onChange={(val) => handleSelectChange("driver", val)}
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          {/* VEHICLE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Vehicle *</label>
            <Select
              options={vehicles}
              value={formData.vehicle}
              onChange={(val) => handleSelectChange("vehicle", val)}
              styles={customSelectStyles}
              isSearchable
              isDisabled={!formData.driver}
              placeholder={
                formData.driver
                  ? "Select vehicle"
                  : "Select driver first"
              }
            />
          </div>

          {/* DATE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              className="w-full h-11 border border-black rounded-xl px-3 
                         focus:outline-none focus:ring-1 focus:ring-black"
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
              className="bg-gray-600 text-white py-3 px-6 rounded-2xl hover:bg-gray-700"
            >
              Back
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateShuttleRouteShiftAssign;