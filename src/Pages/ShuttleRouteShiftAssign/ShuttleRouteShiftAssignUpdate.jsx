import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getAllShuttleRoutes } from "../../Services/ShuttleRouteApi";
import { getAllShuttleRouteShifts } from "../../Services/SuttleRouteShiftApi";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";

import {
  getShuttleRouteShiftAssignById,
  updateShuttleRouteShiftAssignApi,
} from "../../Services/ShuttleRouteShiftAssignApi";

const UpdateShuttleRouteShiftAssign = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  // ✅ LOAD ALL DATA + PREFILL
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [routeRes, shiftRes, driverRes, vehicleRes, assignRes] =
        await Promise.all([
          getAllShuttleRoutes({ page: 1, rowsPerPage: 100 }),
          getAllShuttleRouteShifts({ page: 1, rowsPerPage: 100 }),
          getAllDrivers({ page: 1, rowsPerPage: 100 }),
          getAllVehicles({ page: 1, limit: 100 }),
          getShuttleRouteShiftAssignById(id),
        ]);

      const routesOptions =
        routeRes?.data?.map((r) => ({
          value: r._id,
          label: r.name,
        })) || [];

      const shiftsOptions =
        shiftRes?.data?.map((s) => ({
          value: s._id,
          label: s.shiftName,
        })) || [];

      const driversOptions =
        driverRes?.data?.map((d) => ({
          value: d._id,
          label: d.name || d.phone,
        })) || [];

      setRoutes(routesOptions);
      setShifts(shiftsOptions);
      setDrivers(driversOptions);
      setAllVehicles(vehicleRes?.data || []);

      // ✅ PREFILL DATA
      const d = assignRes?.data;

      if (d) {
        // filter vehicles for selected driver
        const filteredVehicles = vehicleRes?.data?.filter(
          (v) =>
            String(v.driver?._id || v.driver) ===
            String(d.driver?._id)
        );

        const vehicleOptions = filteredVehicles.map((v) => ({
          value: v._id,
          label: `${v.brand} - ${v.carNumber}`,
        }));

        setVehicles(vehicleOptions);

        setFormData({
          shuttleRoute: {
            value: d?.shuttleRoute?._id,
            label: d?.shuttleRoute?.name,
          },
          shuttleRouteShift: {
            value: d?.shuttleRouteShift?._id,
            label: d?.shuttleRouteShift?.shiftName,
          },
          driver: {
            value: d?.driver?._id,
            label: d?.driver?.name || d?.driver?.phone,
          },
          vehicle: {
            value: d?.vehicle?._id,
            label: `${d?.vehicle?.brand} - ${d?.vehicle?.carNumber}`,
          },
          date: d?.date?.slice(0, 10),
        });
      }

    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE SELECT
  const handleSelectChange = (name, selected) => {
    if (name === "driver") {
      const filtered = allVehicles.filter(
        (v) =>
          String(v.driver?._id || v.driver) ===
          String(selected.value)
      );

      const vehicleOptions = filtered.map((v) => ({
        value: v._id,
        label: `${v.brand} - ${v.carNumber}`,
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

  // ✅ SUBMIT UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        driver: formData.driver?.value,
        vehicle: formData.vehicle?.value,
        date: formData.date,
      };

      const res = await updateShuttleRouteShiftAssignApi({
        id,
        data: payload,
      });

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

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#000",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      minHeight: "44px",
    }),
  };

  return (
    <div className="m-3">
      <Breaker />

      <div className="mt-6 bg-white p-6 w-full rounded-xl shadow-xl">

        <h2 className="text-xl font-semibold mb-6">
          Update Shuttle Assignment
        </h2>

        <form onSubmit={handleSubmit}>

          {/* ROUTE (DISABLED) */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Route</label>
            <Select
              value={formData.shuttleRoute}
              isDisabled
              styles={customSelectStyles}
            />
          </div>

          {/* SHIFT (DISABLED) */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Shift</label>
            <Select
              value={formData.shuttleRouteShift}
              isDisabled
              styles={customSelectStyles}
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
              isDisabled={!formData.driver}
            />
          </div>

          {/* DATE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              className="w-full h-11 border border-black rounded-xl px-3"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex  justify-end gap-4 mt-8">

            <button
              type="submit"
              className=" bg-primary text-white py-3 px-6 rounded-2xl"
            >
              Update
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className=" bg-gray-600 text-white py-3 px-6 rounded-2xl"
            >
              Back
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateShuttleRouteShiftAssign;