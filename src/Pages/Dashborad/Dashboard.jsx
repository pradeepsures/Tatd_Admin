import React, { useState, useEffect } from "react";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaUserCheck,
  FaUserAstronaut,
  FaStar,
  FaCar,
  FaRoad,
} from "react-icons/fa";

// import { getAllDrivers } from "../../Services/DriverApi";
// import { getAllVehicles } from "../../Services/VehicleApi";
// import { getAllBookings } from "../../Services/BookingApi";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Commented out API data fetch so dashboard shows 0 counts.
        // const driversRes = await getAllDrivers({
        //   page: 1,
        //   rowsPerPage: 1,
        //   searchQuery: "",
        // });
        // setDriverStats(driversRes?.stats || null);

        // const vehiclesRes = await getAllVehicles({
        //   page: 1,
        //   limit: 1,
        // });
        // setVehicleStats(vehiclesRes?.stats || null);

        // const bookingsRes = await getAllBookings({
        //   page: 1,
        //   rowsPerPage: 1,
        // });
        // setBookingStats(bookingsRes?.stats || null);

        setDriverStats(null);
        setVehicleStats(null);
        setBookingStats(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <Loader />
      </div>
    );
  }

  // ✅ Trips FIRST
  const tripData = [
    { title: "Total Trips", value: bookingStats?.totalBookings || 0, icon: <FaRoad /> },
    { title: "Active Trips", value: bookingStats?.activeTripCount || 0, icon: <FaRoad /> },
    { title: "Completed", value: bookingStats?.completedCount || 0, icon: <FaUserCheck /> },
    { title: "Cancelled", value: bookingStats?.cancelledCount || 0, icon: <FaUserAstronaut /> },
  ];

  // ✅ Drivers SECOND
  const driverData = [
    { title: "Total Chauffeur", value: driverStats?.total || 0, icon: <FaUsers /> },
    { title: "Verified Chauffeur", value: driverStats?.verifiedCount || 0, icon: <FaUserCheck /> },
    { title: "Unverified Chauffeur", value: driverStats?.unverifiedCount || 0, icon: <FaUserAstronaut /> },
    { title: "Online Chauffeur", value: driverStats?.onlineCount || 0, icon: <FaStar /> },
  ];

  // ✅ Vehicles THIRD
  const vehicleData = [
    { title: "Total Vehicles", value: vehicleStats?.total || 0, icon: <FaCar /> },
    { title: "Active Vehicles", value: vehicleStats?.activeCount || 0, icon: <FaCar /> },
    { title: "Inactive Vehicles", value: vehicleStats?.inactiveCount || 0, icon: <FaCar /> },
    { title: "Available Vehicles", value: vehicleStats?.availableCount || 0, icon: <FaCar /> },
  ];

  // ✅ SAME STYLE FOR ALL (BLUE CARDS)
  const renderSection = (title, items) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-wide">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative p-6 rounded-2xl shadow-md transition-all duration-300 
              hover:shadow-2xl hover:-translate-y-1
              bg-gradient-to-l from-[#3B82F6] to-[#1E3A8A] text-white"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-xl text-xl shadow-lg mb-4 bg-white text-[#1E3A8A]">
              {item.icon}
            </div>

            <h3 className="text-sm font-medium uppercase tracking-wide mb-1 text-blue-100">
              {item.title}
            </h3>

            <p className="text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      
      {/* ✅ ORDER FIXED */}
      {renderSection("Trips", tripData)}
      {renderSection("Chauffeur", driverData)}
      {renderSection("Vehicles", vehicleData)}

    </div>
  );
};

export default Dashboard;