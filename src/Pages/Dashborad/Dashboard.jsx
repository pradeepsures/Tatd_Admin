import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../compoents/Loader";
import {
  MdOutlineDirectionsCar,
  MdOutlinePeople,
  MdOutlineAssignment,
  MdOutlinePayments,
  MdOutlinePerson,
  MdOutlinePendingActions,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";
import { getAllBookings } from "../../Services/BookingApi";
import { getAllAdmins } from "../../Services/UserApi";

const StatCard = ({ label, value, icon: Icon, accent, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center gap-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm ${accent}`}>
      <Icon size={30} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-base text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-4xl font-extrabold text-gray-900 mt-1 font-sans">{value ?? 0}</p>
      {sub && <p className="text-xs text-slate-400 font-medium mt-1.5">{sub}</p>}
    </div>
  </div>
);

const ActionCard = ({ title, desc, link, accent, icon: Icon }) => (
  <Link
    to={link}
    className={`flex items-center gap-6 rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${accent}`}
  >
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-gray-800">
      <Icon size={26} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-gray-900 text-lg">{title}</p>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
    <span className="text-gray-400 text-2xl font-light">→</span>
  </Link>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, v, b, u] = await Promise.allSettled([
          getAllDrivers({ page: 1, rowsPerPage: 1, searchQuery: "" }),
          getAllVehicles({ page: 1, limit: 1 }),
          getAllBookings({ page: 1, rowsPerPage: 1 }),
          getAllAdmins({ page: 1, rowsPerPage: 1 }),
        ]);
        if (d.status === "fulfilled") setDriverStats(d.value?.stats);
        if (v.status === "fulfilled") setVehicleStats(v.value?.stats);
        if (b.status === "fulfilled") setBookingStats(b.value?.stats);
        if (u.status === "fulfilled") setUserStats(u.value?.stats);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const pendingVerify = driverStats?.unverifiedCount || 0;
  const unassigned = bookingStats?.unassignedCount || 0;
  const pendingPay = bookingStats?.pendingPaymentCount || 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-6 space-y-12">
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-base text-gray-500 mt-2 font-medium">Real-time health check and metrics of ride operations</p>
        </div>
      </div>

      {/* Action alerts */}
      {(pendingVerify > 0 || unassigned > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {unassigned > 0 && (
            <button
              type="button"
              onClick={() => navigate("/home/booking/pending")}
              className="flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-left hover:bg-amber-100/80 transition-all duration-300 shadow-sm"
            >
              <MdOutlinePendingActions className="text-amber-600 text-4xl shrink-0" />
              <div>
                <p className="font-extrabold text-amber-900 text-lg">{unassigned} Trips Need Driver Assignment</p>
                <p className="text-sm text-amber-700 mt-1 font-medium">Click to navigate to Pending Assignment list to assign chauffeurs →</p>
              </div>
            </button>
          )}
          {pendingVerify > 0 && (
            <button
              type="button"
              onClick={() => navigate("/home/driver")}
              className="flex items-center gap-4 rounded-2xl bg-orange-50 border border-orange-200 p-6 text-left hover:bg-orange-100/80 transition-all duration-300 shadow-sm"
            >
              <MdOutlineVerifiedUser className="text-orange-600 text-4xl shrink-0" />
              <div>
                <p className="font-extrabold text-orange-900 text-lg">{pendingVerify} Drivers Awaiting Verification</p>
                <p className="text-sm text-orange-700 mt-1 font-medium">Review driver KYC documents and grant access approvals →</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 tracking-wide uppercase">Quick Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Assign Drivers to Trips"
            desc="Link chauffeurs and vehicles to unassigned rides."
            link="/home/booking/pending"
            accent="border-blue-100 bg-blue-50/70 hover:bg-blue-50 text-blue-900"
            icon={MdOutlineAssignment}
          />
          <ActionCard
            title="Verify Driver Approvals"
            desc="Validate uploaded license, KYC and driver details."
            link="/home/driver"
            accent="border-emerald-100 bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900"
            icon={MdOutlineVerifiedUser}
          />
          <ActionCard
            title="Manage Fleet Registry"
            desc="Audit all active/inactive operator vehicles."
            link="/home/vehicle"
            accent="border-purple-100 bg-purple-50/70 hover:bg-purple-50 text-purple-900"
            icon={MdOutlineDirectionsCar}
          />
        </div>
      </div>

      {/* Stats Sections */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 tracking-wide uppercase border-b border-gray-100 pb-3">Trip Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Bookings" value={bookingStats?.totalBookings} icon={MdOutlineAssignment} accent="bg-blue-50 text-blue-600" />
          <StatCard label="Active Trips" value={bookingStats?.activeTripCount} icon={MdOutlineDirectionsCar} accent="bg-emerald-50 text-emerald-600" />
          <StatCard label="Unassigned" value={unassigned} icon={MdOutlinePendingActions} accent="bg-amber-50 text-amber-600" sub="Needs chauffeur assignment" />
          <StatCard label="Pending Payments" value={pendingPay} icon={MdOutlinePayments} accent="bg-rose-50 text-rose-600" />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 tracking-wide uppercase border-b border-gray-100 pb-3">Drivers & Fleet Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Registered" value={driverStats?.total} icon={MdOutlinePeople} accent="bg-indigo-50 text-indigo-600" />
          <StatCard label="Verified Chauffeurs" value={driverStats?.verifiedCount} icon={MdOutlineVerifiedUser} accent="bg-emerald-50 text-emerald-600" />
          <StatCard label="Active Online Drivers" value={driverStats?.onlineCount} icon={MdOutlinePeople} accent="bg-teal-50 text-teal-600" />
          <StatCard label="Registered Vehicles" value={vehicleStats?.total} icon={MdOutlineDirectionsCar} accent="bg-purple-50 text-purple-600" sub={`${vehicleStats?.availableCount || 0} vehicles ready`} />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 tracking-wide uppercase border-b border-gray-100 pb-3">Customers & Engagement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total App Users" value={userStats?.total} icon={MdOutlinePerson} accent="bg-slate-50 text-slate-600" />
          <StatCard label="Completed Rides" value={bookingStats?.completedCount} icon={MdOutlineAssignment} accent="bg-emerald-50 text-emerald-600" />
          <StatCard label="Cancelled Rides" value={bookingStats?.cancelledCount} icon={MdOutlineAssignment} accent="bg-red-50 text-red-600" />
          <StatCard label="Assigned Rides" value={bookingStats?.assignedCount} icon={MdOutlineAssignment} accent="bg-sky-50 text-sky-600" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
