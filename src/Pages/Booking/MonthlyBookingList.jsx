import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Modal, Select } from "antd";
import xlsx from "json-as-xlsx";
import { EyeIcon } from "@heroicons/react/24/outline";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";
import { StyledTableCell } from "../../compoents/TableComponents";

import {
  getAllMonthlyBookings,
  assignMonthlyDriver,
  reassignMonthlyDriver,
  getUnassignedMonthlyDrivers,
} from "../../Services/BookingApi";

const { Option } = Select;

export default function MonthlyBookingList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    assignmentStatus: "",
    tripStatus: "",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // DRIVER
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [searchDriver, setSearchDriver] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // FETCH BOOKINGS
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllMonthlyBookings({
        page,
        limit: rowsPerPage,
        ...filters,
      });

      if (res?.status) {
        setData(res.data || []);
        setTotalPages(res.totalPage || 0);
        setStats(res.stats || null);
      }
    } catch (err) {
      toast.error("Error fetching monthly bookings");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // DRIVER FETCH
  const fetchDrivers = useCallback(async () => {
    if (!selectedRowId) return;
    setDriversLoading(true);
    try {
      const res = await getUnassignedMonthlyDrivers(selectedRowId, searchDriver);
      if (res?.status) {
        setDrivers(res.data || []);
      }
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setDriversLoading(false);
    }
  }, [selectedRowId, searchDriver]);

  useEffect(() => {
    if (isAssignModalOpen || isReassignModalOpen) {
      fetchDrivers();
    }
  }, [isAssignModalOpen, isReassignModalOpen, fetchDrivers]);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const handleMenuOpen = (e, id) => {
    setAnchorEl(e.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssignDriver = (bookingId) => {
    setSelectedRowId(bookingId);
    setIsAssignModalOpen(true);
    setSelectedDriver("");
    setSearchDriver("");
  };

  const handleReassignDriver = (bookingId) => {
    setSelectedRowId(bookingId);
    setIsReassignModalOpen(true);
    setSelectedDriver("");
    setSearchDriver("");
  };

  const handleAssignSubmit = async () => {
    if (!selectedDriver) return toast.error("Select chauffeur");

    try {
      setLoading(true);
      let res;
      if (isReassignModalOpen) {
        res = await reassignMonthlyDriver(selectedRowId, selectedDriver);
      } else {
        res = await assignMonthlyDriver(selectedRowId, selectedDriver);
      }

      if (res?.status) {
        toast.success(isReassignModalOpen ? "Chauffeur reassigned successfully" : "Chauffeur assigned successfully");
        fetchBookings();
        setIsAssignModalOpen(false);
        setIsReassignModalOpen(false);
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      paymentStatus: "",
      assignmentStatus: "",
      tripStatus: "",
    });
    setPage(1);
  };

  const exportExcel = () => {
    if (!data.length) return toast.error("No bookings");

    setIsExporting(true);
    const exportData = [
      {
        sheet: "Monthly Bookings",
        columns: [
          { label: "Booking No", value: "bookingNumber" },
          { label: "User Name", value: (r) => r.user?.name },
          { label: "Fare", value: "estimatedFare" },
          { label: "Status", value: "overallStatus" },
        ],
        content: data,
      },
    ];

    try {
      xlsx(exportData, { fileName: "Monthly_Bookings_List" });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && !data.length) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 font-sans">Monthly Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and assign chauffeurs to monthly bookings.</p>
      </div>

      {/* STATS BAR */}
      {stats && (
        <div className="mb-6 bg-gradient-to-r from-[#000428] to-[#004e92] text-white shadow-md rounded-xl px-5 py-3 text-sm flex items-center gap-4 flex-wrap">
          <span>Total: <span className="font-bold text-yellow-300">{stats.totalBookings}</span></span>
          <span className="opacity-40">|</span>
          <span>Active: <span className="font-bold text-green-300">{stats.activeTripCount}</span></span>
          <span className="opacity-40">|</span>
          <span>Completed: <span className="font-bold text-blue-300">{stats.completedCount}</span></span>
          <span className="opacity-40">|</span>
          <span>Cancelled: <span className="font-bold text-red-300">{stats.cancelledCount}</span></span>
          <span className="opacity-40">|</span>
          <span>Assigned: <span className="font-bold text-purple-300">{stats.assignedCount}</span></span>
          <span className="opacity-40">|</span>
          <span>Unassigned: <span className="font-bold text-gray-300">{stats.unassignedCount}</span></span>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Search & Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search booking number..."
            className="border p-2 rounded-xl text-sm"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <select
            className="border p-2 rounded-xl text-sm"
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
          >
            <option value="">Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            className="border p-2 rounded-xl text-sm"
            value={filters.assignmentStatus}
            onChange={(e) => handleFilterChange("assignmentStatus", e.target.value)}
          >
            <option value="">Assignment Status</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="reassigning">Reassigning</option>
          </select>
          <select
            className="border p-2 rounded-xl text-sm"
            value={filters.tripStatus}
            onChange={(e) => handleFilterChange("tripStatus", e.target.value)}
          >
            <option value="">Trip Status</option>
            <option value="not_started">Not Started</option>
            <option value="driver_enroute">Driver Enroute</option>
            <option value="arrived">Reached</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleResetFilters} className="bg-gray-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
            Reset Filters
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium ml-auto">
            {isExporting ? <LoderBtn /> : "Export Excel"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper} className="rounded-xl shadow">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>BOOKING NO</StyledTableCell>
              <StyledTableCell>CUSTOMER INFO</StyledTableCell>
              <StyledTableCell>DETAILS</StyledTableCell>
              <StyledTableCell>TRIP STATUS</StyledTableCell>
              <StyledTableCell>PAYMENT</StyledTableCell>
              <StyledTableCell>CHAUFFEUR INFO</StyledTableCell>
              <StyledTableCell align="center">ACTIONS</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!data.length ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No Monthly Bookings Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell className="font-semibold text-gray-800">{row.bookingNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-800">{row.user?.name || row.travellerName || "_"}</div>
                    <div className="text-xs text-gray-500">{row.user?.phone || row.travellerPhone || "_"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-500">Pickup: {row.pickup?.address}</div>
                    <div className="text-xs text-gray-400 mt-1">Scheduled: {row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : "-"}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                      row.tripStatus === "completed" ? "bg-green-100 text-green-800" :
                      row.tripStatus === "cancelled" ? "bg-red-100 text-red-800" :
                      row.tripStatus === "in_progress" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {row.tripStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-gray-800">₹{row.estimatedFare}</div>
                    <span className={`text-[10px] font-bold uppercase ${row.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"}`}>
                      {row.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.driver ? (
                      <>
                        <div className="font-medium text-gray-800">{row.driver.name}</div>
                        <div className="text-xs text-gray-500">{row.driver.phone}</div>
                        {row.tripStatus?.toLowerCase() !== "completed" && (
                          <button
                            onClick={() => handleReassignDriver(row._id)}
                            className="mt-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded"
                          >
                            Reassign
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No Chauffeur</span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex flex-col items-center gap-1">
                      {row.assignmentStatus === "unassigned" && row.tripStatus?.toLowerCase() !== "completed" && (
                        <button
                          onClick={() => handleAssignDriver(row._id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium"
                        >
                          Assign Driver
                        </button>
                      )}
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, row._id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </div>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedRowId === row._id} onClose={handleMenuClose}>
                      <MenuItem onClick={() => navigate(`/home/booking/bookingdetails/${row._id}?type=monthly`)}>
                        <EyeIcon className="h-5 w-5 mr-2" /> View Details
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack alignItems="center" mt={5}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Stack>
      )}

      {/* CHAUFFEUR ASSIGN MODAL */}
      <Modal
        title={isReassignModalOpen ? "Reassign Chauffeur" : "Assign Chauffeur"}
        open={isAssignModalOpen || isReassignModalOpen}
        onCancel={() => {
          setIsAssignModalOpen(false);
          setIsReassignModalOpen(false);
        }}
        onOk={handleAssignSubmit}
      >
        <div className="my-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2">SELECT AVAILABLE CHAUFFEUR</label>
          <Select
            showSearch
            placeholder="Search Chauffeur by Name/Phone"
            value={selectedDriver || undefined}
            onChange={(val) => setSelectedDriver(val)}
            onSearch={(val) => setSearchDriver(val)}
            style={{ width: "100%" }}
            loading={driversLoading}
            filterOption={false}
          >
            {drivers.map((d) => (
              <Option key={d._id} value={d._id}>
                {d.name} ({d.phone}) - {d.isOnline ? "Online" : "Offline"}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
