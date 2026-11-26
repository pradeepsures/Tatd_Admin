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
  MdOutlineTaskAlt,
  MdOutlineCurrencyRupee,
  MdArrowForward,
  MdOutlineSupportAgent,
  MdOutlinePersonAddAlt,
  MdOutlineSchedule,
} from "react-icons/md";
import { getAllDeashboard } from "../../Services/DeshboardApi";
import { LineChart, areaElementClasses, lineElementClasses } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const TIMEFRAME_LABEL = { last7Days: "Last 7 days", last30Days: "Last 30 days", thisMonth: "This month" };
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const num = (n) => Number(n || 0).toLocaleString("en-IN");

const Panel = ({ title, subtitle, action, children, className = "" }) => (
  <div className={`card overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

const LinkButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
  >
    {children} <MdArrowForward size={14} />
  </button>
);

const KpiTile = ({ label, value, icon: Icon, accent, footer, onClick, children }) => (
  <div
    onClick={onClick}
    className={`card group relative overflow-hidden p-5 ${onClick ? "cursor-pointer transition-shadow hover:shadow-lg" : ""}`}
  >
    <div className={`absolute inset-x-0 top-0 h-[3px] ${accent.bar}`} />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-[28px] font-semibold leading-none tabular-nums tracking-tight text-gray-900">{value}</p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.tile}`}>
        <Icon size={22} />
      </div>
    </div>
    {children}
    {footer && <div className="mt-4 flex items-center justify-between text-xs text-gray-500">{footer}</div>}
  </div>
);

const ACCENTS = {
  gold: { bar: "bg-[#c99a2e]", tile: "bg-[#c99a2e]/12 text-[#a07a1f]" },
  blue: { bar: "bg-blue-500", tile: "bg-blue-50 text-blue-600" },
  emerald: { bar: "bg-emerald-500", tile: "bg-emerald-50 text-emerald-600" },
  violet: { bar: "bg-violet-500", tile: "bg-violet-50 text-violet-600" },
};

const ProgressRow = ({ label, value, total, color, onClick }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold tabular-nums text-gray-900">
          {num(value)} <span className="font-normal text-gray-400">/ {num(total)}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

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
  const collectedPct = currentRevenue.total > 0 ? Math.round((currentRevenue.completed / currentRevenue.total) * 100) : 0;

  // Trip mix for the donut (display only)
  const totalBookings = bookingStats?.totalBookings || 0;
  const completed = bookingStats?.completedCount || 0;
  const active = bookingStats?.activeTripCount || 0;
  const otherTrips = Math.max(0, totalBookings - completed - active - unassigned);
  const tripMix = [
    { id: 0, value: completed, label: "Completed", color: "#10b981" },
    { id: 1, value: active, label: "Active", color: "#3b82f6" },
    { id: 2, value: unassigned, label: "Unassigned", color: "#f59e0b" },
    { id: 3, value: otherTrips, label: "Other", color: "#cbd5e1" },
  ];

  const onlineDrivers = driverStats?.onlineCount || 0;
  const totalDrivers = driverStats?.total || 0;
  const onlinePct = totalDrivers > 0 ? Math.round((onlineDrivers / totalDrivers) * 100) : 0;

  // Helper for tab styling
  const getTabClass = (isActive) =>
    `px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${
      isActive ? "bg-[#111827] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
    }`;

  const quickActions = [
    { label: "Hourly trips", icon: MdOutlineSchedule, to: "/home/booking/hourly" },
    { label: "Add driver", icon: MdOutlinePersonAddAlt, to: "/home/driver/createDriver" },
    { label: "Pending verification", icon: MdOutlineVerifiedUser, to: "/home/driver?verified=pending" },
    { label: "Complaints", icon: MdOutlineSupportAgent, to: "/home/complaint" },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and monitor your daily fleet operations from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ label, icon: Icon, to }) => (
              <button key={to} type="button" onClick={() => navigate(to)} className="btn-secondary">
                <Icon size={16} className="text-gray-500" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Action alerts */}
        {(pendingVerify > 0) && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <MdOutlineVerifiedUser size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-950">{pendingVerify} Drivers Awaiting Verification</h4>
                <p className="text-sm text-amber-800/90">Please review the uploaded KYC documents.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/home/driver?verified=false")}
              className="btn-primary shrink-0 self-start sm:self-auto"
            >
              Review Drivers
            </button>
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiTile
            label={`Collected · ${TIMEFRAME_LABEL[timeframe]}`}
            value={inr(currentRevenue.completed)}
            icon={MdOutlineCurrencyRupee}
            accent={ACCENTS.gold}
          >
            <div className="-mx-1 mt-3 h-10">
              <SparkLineChart
                data={seriesCompleted}
                height={40}
                area
                curve="natural"
                color="#c99a2e"
                sx={{
                  [`& .${areaElementClasses.root}`]: { fillOpacity: 0.15 },
                  [`& .${lineElementClasses.root}`]: { strokeWidth: 2 },
                }}
              />
            </div>
          </KpiTile>
          <KpiTile
            label="Total Bookings"
            value={num(totalBookings)}
            icon={MdOutlineAssignment}
            accent={ACCENTS.blue}
            onClick={() => navigate("/home/booking")}
            footer={
              <>
                <span><span className="font-semibold text-emerald-600">{num(completed)}</span> completed</span>
                <span className="text-gray-400 group-hover:text-gray-700">View →</span>
              </>
            }
          />
          <KpiTile
            label="Active Trips"
            value={num(active)}
            icon={MdOutlineDirectionsCar}
            accent={ACCENTS.emerald}
            onClick={() => navigate("/home/booking")}
            footer={
              <>
                <span><span className="font-semibold text-amber-600">{num(unassigned)}</span> need a driver</span>
                <span className="text-gray-400 group-hover:text-gray-700">View →</span>
              </>
            }
          />
          <KpiTile
            label="Online Drivers"
            value={`${num(onlineDrivers)}`}
            icon={MdOutlinePeople}
            accent={ACCENTS.violet}
            onClick={() => navigate("/home/driver?status=online")}
          >
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                <span>of {num(totalDrivers)} drivers</span>
                <span className="tabular-nums">{onlinePct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${onlinePct}%` }} />
              </div>
            </div>
          </KpiTile>
        </div>

        {/* Revenue + trip mix */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="Revenue"
            subtitle={TIMEFRAME_LABEL[timeframe]}
            action={
              <div className="flex overflow-x-auto rounded-lg bg-gray-100 p-0.5">
                <button onClick={() => setTimeframe("last7Days")} className={getTabClass(timeframe === "last7Days")}>7 Days</button>
                <button onClick={() => setTimeframe("last30Days")} className={getTabClass(timeframe === "last30Days")}>30 Days</button>
                <button onClick={() => setTimeframe("thisMonth")} className={getTabClass(timeframe === "thisMonth")}>This Month</button>
              </div>
            }
          >
            {!revenueStats ? (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                Revenue data is not available yet. Please restart your backend server.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 px-5 pt-5 sm:grid-cols-3">
                  {[
                    ["Total expected", currentRevenue.total, "bg-indigo-500", "text-gray-900"],
                    ["Collected (paid)", currentRevenue.completed, "bg-emerald-500", "text-emerald-600"],
                    ["Pending payment", currentRevenue.pending, "bg-amber-500", "text-amber-600"],
                  ].map(([label, value, dot, color]) => (
                    <div key={label} className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                      <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
                      </p>
                      <p className={`mt-1 text-xl font-semibold tabular-nums ${color}`}>{inr(value)}</p>
                    </div>
                  ))}
                </div>
                <div className="h-[300px] w-full min-w-0 px-1 pb-2 sm:h-[320px]">
                  <LineChart
                    xAxis={[{ scaleType: 'point', data: xAxisData, tickLabelStyle: { fill: '#98a2b3', fontSize: 11 } }]}
                    yAxis={[{ tickLabelStyle: { fill: '#98a2b3', fontSize: 11 }, valueFormatter: (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`) }]}
                    series={[
                      { data: seriesTotal, label: 'Total Fare', color: '#6366f1', area: true, showMark: false, curve: 'natural' },
                      { data: seriesCompleted, label: 'Collected (Paid)', color: '#10b981', area: true, showMark: false, curve: 'natural' },
                      { data: seriesPending, label: 'Pending', color: '#f59e0b', showMark: false, curve: 'natural' },
                    ]}
                    grid={{ horizontal: true }}
                    margin={{ left: 52, right: 20, top: 44, bottom: 24 }}
                    slotProps={{ legend: { direction: 'row', position: { vertical: 'top', horizontal: 'end' } } }}
                    sx={{
                      [`& .${areaElementClasses.root}`]: { fillOpacity: 0.1 },
                      [`& .${lineElementClasses.root}`]: { strokeWidth: 2.25 },
                      '& .MuiChartsGrid-line': { stroke: '#eef0f3' },
                      '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: '#e4e7ec' },
                    }}
                  />
                </div>
              </>
            )}
          </Panel>

          <Panel title="Trip overview" subtitle={`${num(totalBookings)} bookings in total`} action={<LinkButton onClick={() => navigate("/home/booking")}>All trips</LinkButton>}>
            <div className="flex flex-col items-center px-5 pb-5 pt-2">
              <div className="relative h-[220px] w-full">
                <PieChart
                  series={[{
                    data: tripMix,
                    innerRadius: 68,
                    outerRadius: 96,
                    paddingAngle: 2,
                    cornerRadius: 5,
                    cx: '50%',
                  }]}
                  hideLegend
                  margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-semibold tabular-nums text-gray-900">{num(totalBookings)}</p>
                  <p className="text-xs text-gray-500">bookings</p>
                </div>
              </div>
              <div className="mt-2 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                {tripMix.map((t) => (
                  <div key={t.label} className="flex items-center justify-between rounded-lg bg-gray-50/80 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                    <span className="font-semibold tabular-nums text-gray-900">{num(t.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Fleet / payments / customers */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Drivers & fleet" subtitle="Live availability" action={<LinkButton onClick={() => navigate("/home/driver")}>Drivers</LinkButton>}>
            <div className="flex items-center gap-4 px-5 pt-4">
              <div className="h-[120px] w-[120px] shrink-0">
                <Gauge
                  value={onlinePct}
                  startAngle={-110}
                  endAngle={110}
                  innerRadius="78%"
                  outerRadius="100%"
                  cornerRadius="50%"
                  text={`${onlinePct}%`}
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: { fontSize: 20, fontWeight: 600, fill: '#101828' },
                    [`& .${gaugeClasses.valueArc}`]: { fill: '#8b5cf6' },
                    [`& .${gaugeClasses.referenceArc}`]: { fill: '#eef0f3' },
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Online right now</p>
                <p className="text-2xl font-semibold tabular-nums text-gray-900">
                  {num(onlineDrivers)} <span className="text-base font-normal text-gray-400">/ {num(totalDrivers)}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4 px-5 pb-5 pt-3">
              <ProgressRow
                label="Verified chauffeurs"
                value={driverStats?.verifiedCount || 0}
                total={totalDrivers}
                color="bg-indigo-500"
                onClick={() => navigate("/home/driver?verified=true")}
              />
              <ProgressRow
                label="Awaiting verification"
                value={pendingVerify}
                total={totalDrivers}
                color="bg-amber-500"
                onClick={() => navigate("/home/driver?verified=false")}
              />
            </div>
          </Panel>

          <Panel title="Payments" subtitle={TIMEFRAME_LABEL[timeframe]} action={<LinkButton onClick={() => navigate("/home/booking?paymentStatus=pending")}>Pending</LinkButton>}>
            <div className="space-y-5 p-5">
              <div>
                <div className="flex items-end justify-between">
                  <p className="text-sm text-gray-500">Collection rate</p>
                  <p className="text-2xl font-semibold tabular-nums text-gray-900">{collectedPct}%</p>
                </div>
                <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${collectedPct}%` }} />
                  <div className="h-full bg-amber-400" style={{ width: `${100 - collectedPct}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Collected {inr(currentRevenue.completed)}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Pending {inr(currentRevenue.pending)}</span>
                </div>
              </div>
              <div
                onClick={() => navigate("/home/booking?paymentStatus=pending")}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3 transition-colors hover:bg-rose-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500 text-white">
                    <MdOutlinePayments size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{num(pendingPay)} pending payments</p>
                    <p className="text-xs text-gray-500">Bookings waiting to be paid</p>
                  </div>
                </div>
                <MdArrowForward className="text-gray-400" />
              </div>
              <div
                onClick={() => navigate("/home/booking?assignmentStatus=unassigned")}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 transition-colors hover:bg-amber-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <MdOutlinePendingActions size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{num(unassigned)} unassigned trips</p>
                    <p className="text-xs text-gray-500">Need a driver</p>
                  </div>
                </div>
                <MdArrowForward className="text-gray-400" />
              </div>
            </div>
          </Panel>

          <Panel title="Customers" subtitle="App users and rides" action={<LinkButton onClick={() => navigate("/home/users")}>Users</LinkButton>}>
            <div className="grid grid-cols-2 gap-3 p-5">
              <div onClick={() => navigate("/home/users")} className="cursor-pointer rounded-xl bg-gradient-to-br from-[#171b25] to-[#0f1117] p-4 text-white">
                <MdOutlinePerson size={20} className="text-[#d9ae4a]" />
                <p className="mt-3 text-2xl font-semibold tabular-nums">{num(userStats?.total)}</p>
                <p className="text-xs text-gray-400">Total app users</p>
              </div>
              <div onClick={() => navigate("/home/booking?tripStatus=completed")} className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <MdOutlineTaskAlt size={20} className="text-emerald-600" />
                <p className="mt-3 text-2xl font-semibold tabular-nums text-gray-900">{num(completed)}</p>
                <p className="text-xs text-gray-500">Completed rides</p>
              </div>
              <div onClick={() => navigate("/home/driver?verified=true")} className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <MdOutlineVerifiedUser size={20} className="text-indigo-600" />
                <p className="mt-3 text-2xl font-semibold tabular-nums text-gray-900">{num(driverStats?.verifiedCount)}</p>
                <p className="text-xs text-gray-500">Verified chauffeurs</p>
              </div>
              <div onClick={() => navigate("/home/booking?paymentStatus=pending")} className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <MdOutlineCurrencyRupee size={20} className="text-[#a07a1f]" />
                <p className="mt-3 text-2xl font-semibold tabular-nums text-gray-900">{inr(currentRevenue.total)}</p>
                <p className="text-xs text-gray-500">Expected · {TIMEFRAME_LABEL[timeframe].toLowerCase()}</p>
              </div>
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
