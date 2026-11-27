import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
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

import BookingFilter from "./BookingFilter";

import { getAllBookings, assignDriver as assignDriverApi, getUnassignedDriversBySegment } from "../../Services/BookingApi";
import { getAllDrivers } from "../../Services/DriverApi";
import { StyledTableCell } from "../../compoents/TableComponents";

const { Option } = Select;

// Presentational only: maps a trip status string to a badge class.
const tripStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "badge-success";
  if (s === "cancelled" || s === "canceled") return "badge-danger";
  if (s === "in_progress" || s === "ongoing" || s === "started") return "badge-info";
  if (s) return "badge-warning";
  return "badge-neutral";
};

export default function BookingList({
  pageTitle = "All Trips",
  pageDescription = "View all ride bookings. Assign drivers to unassigned trips.",
  presetFilters = {},
}) {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedSegment, setSelectedSegment] = useState("");
  // ✅ FIXED FILTER STATE (IMPORTANT)
  const [filters, setFilters] = useAdminListState("filters", {
    searchQuery: "",
    startDate: "",
    endDate: "",
    overallStatus: "",
    tripStatus: "",
    paymentStatus: "",
    assignmentStatus: "",
    bookingType: "",
    region: "",
    segment: "",
    driverId: "",
    driverName: "",
    driverPhone: "",
    carNumber: "",
    ...presetFilters,
  });

  const [isExporting, setIsExporting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // DRIVER
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [searchDriver, setSearchDriver] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // ✅ FETCH BOOKINGS
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllBookings({
        page,
        rowsPerPage,
        ...filters,
      });

      if (res?.status) {
        setData(res.data);
        setTotalPages(res.totalPage);
        setStats(res.stats);
      }
    } catch {
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ✅ APPLY FILTER
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // ✅ RESET FILTER
  const handleResetFilters = () => {
    const empty = {
      searchQuery: "",
      startDate: "",
      endDate: "",
      overallStatus: "",
      tripStatus: "",
      paymentStatus: "",
      assignmentStatus: "",
      bookingType: "",
      region: "",
      segment: "",
      driverId: "",
      driverName: "",
      driverPhone: "",
      carNumber: "",
    };

    setFilters(empty);
    setPage(1);
  };

  // DRIVER FETCH
  const fetchDrivers = useCallback(async () => {
    if (!selectedSegment) return;

    setDriversLoading(true);

    try {
      const res = await getUnassignedDriversBySegment(selectedSegment);

      if (res?.status) {
        setDrivers(res.data || []);
      }
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setDriversLoading(false);
    }
  }, [selectedSegment]);
  // const fetchDrivers = useCallback(async (search) => {
  //   setDriversLoading(true);
  //   try {
  //     const res = await getAllDrivers({
  //       page: 1,
  //       rowsPerPage: 50,
  //       searchQuery: search || "",
  //     });

  //     if (res?.status) setDrivers(res.data || []);
  //   } catch {
  //     toast.error("Failed to load drivers");
  //   } finally {
  //     setDriversLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (isAssignModalOpen) {
  //     fetchDrivers(searchDriver);
  //   }
  // }, [isAssignModalOpen, searchDriver, fetchDrivers]);

  useEffect(() => {
    if (isAssignModalOpen && selectedSegment) {
      fetchDrivers();
    }
  }, [isAssignModalOpen, selectedSegment, fetchDrivers]);

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


  const handleAssignDriver = (bookingId, segmentId) => {
    setSelectedRowId(bookingId);
    setSelectedSegment(segmentId); // ✅ now correct
    setIsAssignModalOpen(true);
    setSelectedDriver("");
    setSearchDriver("");
  };

  // const handleAssignSubmit = async () => {
  //   if (!selectedDriver) return toast.error("Select driver");

  //   try {
  //     setLoading(true);

  //     const res = await assignDriverApi(selectedRowId, selectedDriver);

  //     if (res?.status) {
  //       toast.success("Driver assigned");
  //       fetchBookings();
  //       setIsAssignModalOpen(false);
  //     }
  //   } catch {
  //     toast.error("Error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // EXPORT
  const handleAssignSubmit = async () => {
    if (!selectedDriver) return toast.error("Select driver");

    try {
      setLoading(true);

      const res = await assignDriverApi(selectedRowId, selectedDriver);

      if (res?.status) {
        toast.success("Driver assigned");

        fetchBookings();

        setIsAssignModalOpen(false);
      }
    } catch {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!data.length) return toast.error("No bookings");

    setIsExporting(true);

    const exportData = [
      {
        sheet: "Bookings",
        columns: [
          { label: "Booking No", value: "bookingNumber" },
          { label: "User Name", value: (r) => r.user?.name },
          { label: "Region", value: (r) => r.region?.name },
          { label: "Fare", value: "estimatedFare" },
          { label: "Status", value: "overallStatus" },
        ],
        content: data,
      },
    ];

    try {
      xlsx(exportData, { fileName: "Booking_List" });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">

      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">{pageDescription}</p>
        </div>

        <div className="page-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportExcel}
            className="btn-secondary"
          >
            {isExporting ? <LoderBtn /> : "Export Excel"}
          </motion.button>
        </div>
      </div>

      {/* BOOKING STATS */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">

          <div className="card px-4 py-3">
            <div className="section-label">Total:</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{stats.totalBookings}</div>
          </div>

          <div className="card px-4 py-3">
            <div className="section-label">Active Trip:</div>
            <div className="mt-1 text-lg font-semibold text-blue-700">
              {stats.activeTripCount}
            </div>
          </div>

          <div className="card px-4 py-3">
            <div className="section-label">Completed:</div>
            <div className="mt-1 text-lg font-semibold text-emerald-700">
              {stats.completedCount}
            </div>
          </div>

          <div className="card px-4 py-3">
            <div className="section-label">Cancelled:</div>
            <div className="mt-1 text-lg font-semibold text-rose-700">
              {stats.cancelledCount}
            </div>
          </div>

          <div className="card px-4 py-3">
            <div className="section-label">Assigned:</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {stats.assignedCount}
            </div>
          </div>

          <div className="card px-4 py-3">
            <div className="section-label">Unassigned:</div>
            <div className="mt-1 text-lg font-semibold text-slate-500">
              {stats.unassignedCount}
            </div>
          </div>

          <div className="card px-4 py-3">
            <div className="section-label">Pending Payment:</div>
            <div className="mt-1 text-lg font-semibold text-amber-700">
              {stats.pendingPaymentCount}
            </div>
          </div>

        </div>
      )}

      {/* ✅ FIXED FILTER */}
      <BookingFilter
        appliedFilters={filters}   // ⭐ IMPORTANT FIX
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <TableContainer component={Paper} className="overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>BOOKING</StyledTableCell>
              <StyledTableCell>INFORMATION</StyledTableCell>
              <StyledTableCell>TRIP STATUS</StyledTableCell>
              <StyledTableCell>SEGMENT</StyledTableCell>
              <StyledTableCell>VEHICLE</StyledTableCell>
              <StyledTableCell>CHAUFFEUR INFO</StyledTableCell>
              <StyledTableCell align="center">ACTIONS</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!data.length ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="!py-14 !text-slate-400">
                  No Bookings Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell className="whitespace-nowrap !font-semibold !text-slate-900">{row.bookingNumber}</TableCell>

                  <TableCell>
                    <div className="font-semibold text-slate-800">
                      {row.user?.name || "_"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      PickUp:- {row.pickup?.address || "-"}
                    </div>

                    <div className="text-xs text-slate-500">
                      Drop:- {row.dropoff?.address || "-"}
                    </div>

                    <div className="mt-1.5 text-xs font-medium text-slate-600">
                      Pickup Date: {row.tripStartAtIST || "-"}
                    </div>

                    <div className="text-xs font-medium text-slate-600">
                      Drop date: {row.tripEndAtIST || "-"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className={`${tripStatusBadge(row.tripStatus)} whitespace-nowrap capitalize`}>
                      {row.tripStatus || "-"}
                    </span>
                  </TableCell>
                  <TableCell>{row.segment?.name || "-"}</TableCell>
                  <TableCell>
                    {row.vehicle ? (
                      <>
                        {row.vehicle.carNumber || "-"}<br />
                        {row.vehicle?.brand || "-"}<br />
                        {row.vehicle?.model || "-"}
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>


                  <TableCell>
                    {row.driver ? (
                      <>
                        {row.driver.name || "-"}<br />
                        {row.driver.phone || "-"}<br />
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <div className="flex flex-col items-center gap-1.5">
                      {row.assignmentStatus === "unassigned" &&
                        row.tripStatus?.toLowerCase() !== "completed" && (
                          <button
                            onClick={() => handleAssignDriver(row._id, row.segment?._id)}
                            className="btn-primary !h-8 !px-3 !text-xs"
                          >
                            Assign Driver
                          </button>
                        )}
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, row._id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </div>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row._id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() =>
                          navigate(`/home/booking/bookingdetails/${row._id}`)
                        }
                      >
                        <EyeIcon className="h-5 w-5 mr-2" /> View
                      </MenuItem>


                      {row.assignmentStatus === "unassigned" &&
                        row.tripStatus?.toLowerCase() !== "completed" && (
                          <MenuItem
                            onClick={() =>
                              handleAssignDriver(row._id, row.segment?._id)
                            }
                          >
                            Assign Chauffeur
                          </MenuItem>
                        )}

                      {/* {row.assignmentStatus === "unassigned" && (
                        <MenuItem onClick={() => handleAssignDriver(row._id, row.segment?._id)}>
                          🚗 Assign Chauffeur
                        </MenuItem>
                      )} */}
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

      {/* MODAL */}
      <Modal
        title="Assign Chauffeur"
        open={isAssignModalOpen}
        onCancel={() => {
          setIsAssignModalOpen(false);
        }}
        onOk={handleAssignSubmit}
      >
        <Select
          showSearch
          placeholder="Select Chauffeur"
          value={selectedDriver || undefined}
          onChange={(val) => setSelectedDriver(val)}
          onSearch={(val) => setSearchDriver(val)}
          style={{ width: "100%" }}
          loading={driversLoading}
        >
          {drivers.map((d) => (
            <Option key={d._id} value={d._id}>
              {d.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}