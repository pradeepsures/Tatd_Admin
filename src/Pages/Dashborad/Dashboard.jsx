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
  MdOutlineCurrencyRupee,
  MdTrendingUp,
} from "react-icons/md";
import { getAllDeashboard } from "../../Services/DeshboardApi";
import { BarChart } from '@mui/x-charts/BarChart';

const StatCard = ({ label, value, icon: Icon, iconColor, iconBg, sub, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${onClick ? 'cursor-pointer hover:border-blue-300 hover:-translate-y-1' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div className="text-gray-300">
        <MdTrendingUp size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">{value ?? 0}</h3>
      <p className="text-sm font-semibold text-gray-500 mt-1">{label}</p>
    </div>
    {sub && (
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-500">
        {sub}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  
  const [revenueStats, setRevenueStats] = useState(null);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [timeframe, setTimeframe] = useState("last7Days"); 

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllDeashboard({ page: 1, rowsPerPage: 10, searchQuery: "" });
        if (res?.status) {
          setDriverStats(res.data.driverStats);
          setVehicleStats(res.data.vehicleStats);
          setBookingStats(res.data.bookingStats);
          setUserStats(res.data.userStats);
          setRevenueStats(res.data.revenueStats || null);
          setRevenueChartData(res.data.revenueChartData || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
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

  const formatShortDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  const filteredChartData = [...revenueChartData].sort((a, b) => new Date(a.date) - new Date(b.date));
  let chartDisplayData = [];
  
  if (timeframe === "last7Days") {
    chartDisplayData = filteredChartData.slice(-7);
  } else if (timeframe === "last30Days") {
    chartDisplayData = filteredChartData;
  } else if (timeframe === "thisMonth") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const year = startOfMonth.getFullYear();
    const month = String(startOfMonth.getMonth() + 1).padStart(2, '0');
    const day = String(startOfMonth.getDate()).padStart(2, '0');
    const startStr = `${year}-${month}-${day}`;
    chartDisplayData = filteredChartData.filter(d => d.date >= startStr);
  }

  const xAxisData = chartDisplayData.length > 0 ? chartDisplayData.map(d => formatShortDate(d.date)) : ['No Data'];
  const seriesTotal = chartDisplayData.length > 0 ? chartDisplayData.map(d => d.total) : [0];
  const seriesCompleted = chartDisplayData.length > 0 ? chartDisplayData.map(d => d.completed) : [0];
  const seriesPending = chartDisplayData.length > 0 ? chartDisplayData.map(d => d.pending) : [0];
  
  const currentRevenue = revenueStats?.[timeframe] || { total: 0, completed: 0, pending: 0 };

  // Helper for tab styling
  const getTabClass = (isActive) => 
    `px-4 py-2 text-sm font-semibold rounded-md transition-all ${isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900 border border-transparent"}`;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Manage and monitor your daily fleet operations from one place.</p>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Action alerts */}
        {(pendingVerify > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                <MdOutlineVerifiedUser size={24} />
              </div>
              <div>
                <h4 className="text-orange-900 font-bold text-lg">{pendingVerify} Drivers Awaiting Verification</h4>
                <p className="text-orange-700 text-sm mt-0.5">Please review the uploaded KYC documents.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/home/driver?verified=false")}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Review Drivers
            </button>
          </div>
        )}

        {/* Revenue Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <MdOutlineCurrencyRupee size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button onClick={() => setTimeframe("last7Days")} className={getTabClass(timeframe === "last7Days")}>7 Days</button>
              <button onClick={() => setTimeframe("last30Days")} className={getTabClass(timeframe === "last30Days")}>30 Days</button>
              <button onClick={() => setTimeframe("thisMonth")} className={getTabClass(timeframe === "thisMonth")}>This Month</button>
            </div>
          </div>
          
          {!revenueStats ? (
            <div className="w-full p-6 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 font-medium flex items-center gap-3">
              <span className="text-xl">ℹ️</span> Revenue data is not available yet. Please restart your backend server.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Vertical Stats */}
              <div className="flex flex-col justify-center space-y-6 lg:border-r border-gray-100 lg:pr-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Expected</p>
                  <h4 className="text-3xl font-black text-gray-900">₹{currentRevenue.total.toLocaleString()}</h4>
                </div>
                <div className="h-px w-full bg-gray-100"></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Collected (Paid)</p>
                  <h4 className="text-3xl font-black text-green-600">₹{currentRevenue.completed.toLocaleString()}</h4>
                </div>
                <div className="h-px w-full bg-gray-100"></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Payment</p>
                  <h4 className="text-3xl font-black text-orange-500">₹{currentRevenue.pending.toLocaleString()}</h4>
                </div>
              </div>

              {/* Chart */}
              <div className="lg:col-span-3 h-[360px] w-full">
                <BarChart
                  xAxis={[{ scaleType: 'band', data: xAxisData, tickLabelStyle: { fill: '#64748b', fontSize: 12 } }]}
                  yAxis={[{ tickLabelStyle: { fill: '#64748b', fontSize: 12 } }]}
                  series={[
                    { data: seriesTotal, label: 'Total Fare', color: '#6366f1' },
                    { data: seriesCompleted, label: 'Collected (Paid)', color: '#10b981' },
                    { data: seriesPending, label: 'Pending', color: '#f59e0b' },
                  ]}
                  margin={{ left: 60, right: 20, top: 40, bottom: 20 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'top', horizontal: 'middle' },
                      padding: 0,
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Core Operations Grid */}
        <div className="space-y-8">
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlineAssignment className="text-blue-500" /> Trip Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Total Bookings" 
                value={bookingStats?.totalBookings} 
                icon={MdOutlineAssignment} 
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                onClick={() => navigate("/home/booking")}
              />
              <StatCard 
                label="Active Trips" 
                value={bookingStats?.activeTripCount} 
                icon={MdOutlineDirectionsCar} 
                iconBg="bg-green-50"
                iconColor="text-green-600"
                onClick={() => navigate("/home/booking")} 
              />
              <StatCard 
                label="Unassigned" 
                value={unassigned} 
                icon={MdOutlinePendingActions} 
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                sub={<span><strong className="text-gray-900">{unassigned}</strong> needs driver</span>} 
                onClick={() => navigate("/home/booking?assignmentStatus=unassigned")}
              />
              <StatCard 
                label="Pending Payments" 
                value={pendingPay} 
                icon={MdOutlinePayments} 
                iconBg="bg-red-50"
                iconColor="text-red-600"
                onClick={() => navigate("/home/booking?paymentStatus=pending")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Drivers */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MdOutlinePeople className="text-indigo-500" /> Drivers & Fleet
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard 
                  label="Verified Chauffeurs" 
                  value={driverStats?.verifiedCount} 
                  icon={MdOutlineVerifiedUser} 
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-600"
                  onClick={() => navigate("/home/driver?verified=true")}
                />
                <StatCard 
                  label="Online Drivers" 
                  value={driverStats?.onlineCount} 
                  icon={MdOutlinePeople} 
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                  sub={`Active now out of ${driverStats?.total || 0} total`}
                  onClick={() => navigate("/home/driver?status=online")}
                />
              </div>
            </div>

            {/* Customers */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MdOutlinePerson className="text-teal-500" /> Customers Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard 
                  label="Completed Rides" 
                  value={bookingStats?.completedCount} 
                  icon={MdOutlineAssignment} 
                  iconBg="bg-teal-50"
                  iconColor="text-teal-600"
                  onClick={() => navigate("/home/booking?tripStatus=completed")}
                />
                <StatCard 
                  label="Total App Users" 
                  value={userStats?.total} 
                  icon={MdOutlinePerson} 
                  iconBg="bg-slate-100"
                  iconColor="text-slate-600"
                  onClick={() => navigate("/home/users")}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
