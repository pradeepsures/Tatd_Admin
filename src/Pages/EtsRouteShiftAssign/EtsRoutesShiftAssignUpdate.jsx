import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getAllEtsRoutes } from "../../Services/EtsRouteApi";
import { getAllEtsRouteShift } from "../../Services/EtsRouteShift";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";

import {
  getEtsRouteShiftAssignById,
  updateEtsRouteShiftAssignApi,
} from "../../Services/EtsRouteShiftaAssign";

const UpdateEtsRouteShiftAssign = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  const [formData, setFormData] = useState({
    etsRoute: null,
    etsRouteShift: null,
    driver: null,
    vehicle: null,
    date: "",
  });

  // ✅ LOAD ALL DATA
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [
        routeRes,
        shiftRes,
        driverRes,
        vehicleRes,
        detailRes,
      ] = await Promise.all([
        getAllEtsRoutes({ page: 1, rowsPerPage: 100 }),
        getAllEtsRouteShift({ page: 1, rowsPerPage: 100 }),
        getAllDrivers({ page: 1, rowsPerPage: 100 }),
        getAllVehicles({ page: 1, limit: 100 }),
        getEtsRouteShiftAssignById(id),
      ]);

      const routeOptions =
        routeRes?.data?.map((r) => ({
          value: r._id,
          label: r.name,
        })) || [];

      const shiftOptions =
        shiftRes?.data?.map((s) => ({
          value: s._id,
          label: s.shiftName,
        })) || [];

      const driverOptions =
        driverRes?.data?.map((d) => ({
          value: d._id,
          label: d.name || d.phone,
        })) || [];

      const vehiclesData = vehicleRes?.data || [];

      setRoutes(routeOptions);
      setShifts(shiftOptions);
      setDrivers(driverOptions);
      setAllVehicles(vehiclesData);

      // ✅ PREFILL
      if (detailRes?.status) {
        const d = detailRes.data;

        // filter vehicles for selected driver
        const filteredVehicles = vehiclesData.filter(
          (v) => String(v.driver?._id || v.driver) === String(d.driver?._id)
        );

        const vehicleOptions = filteredVehicles.map((v) => ({
          value: v._id,
          label: `${v.brand} - ${v.carNumber}`,
        }));

        setVehicles(vehicleOptions);

        setFormData({
          etsRoute: {
            value: d.etsRoute?._id,
            label: d.etsRoute?.name,
          },
          etsRouteShift: {
            value: d.etsRouteShift?._id,
            label: d.etsRouteShift?.shiftName,
          },
          driver: {
            value: d.driver?._id,
            label: d.driver?.name || d.driver?.phone,
          },
          vehicle: {
            value: d.vehicle?._id,
            label: `${d.vehicle?.brand} - ${d.vehicle?.carNumber}`,
          },
          date: d.date?.split("T")[0],
        });
      }

    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE SELECT
  const handleSelectChange = (name, selected) => {
    if (name === "driver") {
      const filteredVehicles = allVehicles.filter(
        (v) => String(v.driver?._id || v.driver) === String(selected.value)
      );

      const vehicleOptions = filteredVehicles.map((v) => ({
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

  const handleChange = (e) => {
    setFormData({ ...formData, date: e.target.value });
  };

  // ✅ SUBMIT UPDATE
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

      const res = await updateEtsRouteShiftAssignApi({
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

  // ✅ STYLES
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#000",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      minHeight: "44px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <div className="m-3">
      <Breaker />

      <div className="mt-6 bg-white p-6 w-full rounded-xl shadow-xl">

        <h2 className="text-xl font-semibold mb-6">
          Update Route Shift Assignment
        </h2>

        <form onSubmit={handleSubmit}>

          {/* ROUTE */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Route *</label>
            <Select
              options={routes}
              value={formData.etsRoute}
              onChange={(val) => handleSelectChange("etsRoute", val)}
              styles={customSelectStyles}
            />
          </div>

          {/* SHIFT */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Shift *</label>
            <Select
              options={shifts}
              value={formData.etsRouteShift}
              onChange={(val) => handleSelectChange("etsRouteShift", val)}
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
              onChange={handleChange}
              className="w-full h-11 border border-black rounded-xl px-3"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            <button
              type="submit"
              className="bg-primary text-white py-3 px-6 rounded-2xl"
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

export default UpdateEtsRouteShiftAssign;