import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
  getAllOutstationBookings,
  assignOutstationDriver,
  reassignOutstationDriver,
  getUnassignedOutstationDrivers,
} from "../../Services/BookingApi";

const { Option } = Select;

export default function OutstationBookingList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useAdminListState("filters", {
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
      const res = await getAllOutstationBookings({
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
      toast.error("Error fetching Outstation bookings");
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
      const res = await getUnassignedOutstationDrivers(selectedRowId, searchDriver);
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
        res = await reassignOutstationDriver(selectedRowId, selectedDriver);
      } else {
        res = await assignOutstationDriver(selectedRowId, selectedDriver);
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
        sheet: "Outstation Bookings",
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
      xlsx(exportData, { fileName: "Outstation_Bookings_List" });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && !data.length) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Outstation Bookings</h1>
          <p className="page-subtitle">Manage and assign chauffeurs to Outstation plans.</p>
        </div>
        <div className="page-actions">
          <button onClick={exportExcel} className="btn-secondary">
            {isExporting ? <LoderBtn /> : "Export Excel"}
          </button>
        </div>
      </div>

      {/* STATS BAR */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <div className="card px-4 py-3">
            <div className="section-label">Total:</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{stats.totalBookings}</div>
          </div>
          <div className="card px-4 py-3">
            <div className="section-label">Active:</div>
            <div className="mt-1 text-lg font-semibold text-blue-700">{stats.activeTripCount}</div>
          </div>
          <div className="card px-4 py-3">
            <div className="section-label">Completed:</div>
            <div className="mt-1 text-lg font-semibold text-emerald-700">{stats.completedCount}</div>
          </div>
          <div className="card px-4 py-3">
            <div className="section-label">Cancelled:</div>
            <div className="mt-1 text-lg font-semibold text-rose-700">{stats.cancelledCount}</div>
          </div>
          <div className="card px-4 py-3">
            <div className="section-label">Assigned:</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{stats.assignedCount}</div>
          </div>
          <div className="card px-4 py-3">
            <div className="section-label">Unassigned:</div>
            <div className="mt-1 text-lg font-semibold text-slate-500">{stats.unassignedCount}</div>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="card card-pad">
        <div className="mb-4">
          <p className="section-label">Refine results</p>
          <h3 className="card-title mt-1">Search & Filters</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Search booking number..."
            className="field !h-10"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <select
            className="field !h-10"
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
            className="field !h-10"
            value={filters.assignmentStatus}
            onChange={(e) => handleFilterChange("assignmentStatus", e.target.value)}
          >
            <option value="">Assignment Status</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="reassigning">Reassigning</option>
          </select>
          <select
            className="field !h-10"
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
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
          <button onClick={handleResetFilters} className="btn-secondary w-full sm:w-auto">
            Reset Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper} className="overflow-hidden">
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
                <TableCell colSpan={8} align="center" className="!py-14 !text-slate-400">
                  No Outstation Bookings Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell className="whitespace-nowrap !font-semibold !text-slate-900">{row.bookingNumber}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-800">{row.user?.name || row.travellerName || "_"}</div>
                    <div className="text-xs text-slate-500">{row.user?.phone || row.travellerPhone || "_"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-500">Pickup: {row.pickup?.address}</div>
                    <div className="mt-1 text-xs text-slate-400">Scheduled: {row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : "-"}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`whitespace-nowrap uppercase ${
                      row.tripStatus === "completed" ? "badge-success" :
                      row.tripStatus === "cancelled" ? "badge-danger" :
                      row.tripStatus === "in_progress" ? "badge-info" : "badge-warning"
                    }`}>
                      {row.tripStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="mb-1 text-sm font-bold text-slate-900">₹{row.estimatedFare}</div>
                    <span className={`whitespace-nowrap uppercase !text-[10px] ${row.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}>
                      {row.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.driver ? (
                      <>
                        <div className="font-semibold text-slate-800">{row.driver.name}</div>
                        <div className="text-xs text-slate-500">{row.driver.phone}</div>
                        {row.tripStatus?.toLowerCase() !== "completed" && (
                          <button
                            onClick={() => handleReassignDriver(row._id)}
                            className="mt-2 inline-flex h-7 items-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Reassign
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs italic text-slate-400">No Chauffeur</span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex flex-col items-center gap-1.5">
                      {row.assignmentStatus === "unassigned" && row.tripStatus?.toLowerCase() !== "completed" && (
                        <button
                          onClick={() => handleAssignDriver(row._id)}
                          className="btn-primary !h-8 !px-3 !text-xs"
                        >
                          Assign Driver
                        </button>
                      )}
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, row._id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </div>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedRowId === row._id} onClose={handleMenuClose}>
                      <MenuItem onClick={() => navigate(`/home/booking/bookingdetails/${row._id}?type=Outstation`)}>
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
        <Stack alignItems="center" mt={2}>
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
          <label className="field-label">SELECT AVAILABLE CHAUFFEUR</label>
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
