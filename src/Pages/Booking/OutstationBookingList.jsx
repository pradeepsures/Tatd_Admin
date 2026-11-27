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
import xlsx from "json-as-xlsx";
import { EyeIcon } from "@heroicons/react/24/outline";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";
import { StyledTableCell } from "../../compoents/TableComponents";

import {
  getAllTripBookings,
} from "../../Services/BookingApi";
import BookingDriverActions from "./BookingDriverActions";
import TripBookingFilters from "./TripBookingFilters";
import {
  getBookingAmount,
  getBookingDate,
  getBookingReference,
  getBookingStatus,
  getPaymentStatus,
  getStatusBadge,
} from "./tripBookingUtils";

export default function OutstationBookingList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useAdminListState("filters", {
    search: "",
    city: "",
    status: "",
    tripType: "",
    startDate: "",
    endDate: "",
    paymentStatus: "",
    paymentMethod: "",
    isPremium: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [stats, setStats] = useState(null);

  // FETCH BOOKINGS
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllTripBookings({
        ...filters,
        page,
        limit: rowsPerPage,
        bookingType: "outstation",
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

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      city: "",
      status: "",
      tripType: "",
      startDate: "",
      endDate: "",
      paymentStatus: "",
      paymentMethod: "",
      isPremium: "",
      sortBy: "createdAt",
      sortOrder: "desc",
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
          { label: "Booking No", value: (row) => getBookingReference(row) },
          { label: "User Name", value: (r) => r.user?.name },
          { label: "Fare", value: (row) => getBookingAmount(row) },
          { label: "Status", value: (row) => getBookingStatus(row) },
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
      <TripBookingFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

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
                  <TableCell className="whitespace-nowrap !font-semibold !text-slate-900">{getBookingReference(row)}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-800">{row.user?.name || row.travellerName || "_"}</div>
                    <div className="text-xs text-slate-500">{row.user?.phone || row.travellerPhone || row.user?.email || "_"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-500">Pickup: {row.pickup?.address || "-"}</div>
                    <div className="mt-1 text-xs text-slate-500">City: {row.city?.name || "-"}</div>
                    <div className="mt-1 text-xs text-slate-400">Scheduled: {getBookingDate(row)}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`whitespace-nowrap uppercase ${getStatusBadge(getBookingStatus(row))}`}>
                      {getBookingStatus(row)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="mb-1 text-sm font-bold text-slate-900">₹{getBookingAmount(row)}</div>
                    <span className={`whitespace-nowrap uppercase !text-[10px] ${getStatusBadge(getPaymentStatus(row))}`}>
                      {getPaymentStatus(row)}
                    </span>
                    <div className="mt-1 text-xs text-slate-500">{row.payment?.method || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <BookingDriverActions
                      bookingId={row._id}
                      driver={row.driver}
                      assignmentStatus={row.assignmentStatus}
                      bookingStatus={getBookingStatus(row)}
                      onRefresh={fetchBookings}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex flex-col items-center gap-1.5">
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

    </div>
  );
}
