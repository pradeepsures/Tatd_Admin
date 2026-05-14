import * as React from "react";
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
import { reassignCancelRequestApi } from "../../Services/RequestApi";

const { Option } = Select;

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function BookingList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedSegment, setSelectedSegment] = useState("");
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // ✅ FIXED FILTER STATE (IMPORTANT)
  const [filters, setFilters] = useState({
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

  const handleReassignDriver = (bookingId, segmentId) => {
    setSelectedRowId(bookingId);
    setSelectedSegment(segmentId);
    setIsReassignModalOpen(true);
    setSelectedDriver("");
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

      let res;

      if (isReassignModalOpen) {
        // ✅ REASSIGN API
        res = await reassignCancelRequestApi(selectedRowId, selectedDriver);
      } else {
        // ✅ NORMAL ASSIGN
        res = await assignDriverApi(selectedRowId, selectedDriver);
      }

      if (res?.status) {
        toast.success(
          isReassignModalOpen
            ? "Driver reassigned"
            : "Driver assigned"
        );

        fetchBookings();

        setIsAssignModalOpen(false);
        setIsReassignModalOpen(false);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* <Breaker /> */}

      <div className="flex justify-between items-center mb-4">

        {/* LEFT */}
        <Breaker />

        {/* RIGHT - BOOKING STATS */}
        {stats && (
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white shadow-md rounded-lg px-4 py-2 text-sm flex items-center gap-3 flex-wrap">

            <span>
              <span className="opacity-80">Total:</span>{" "}
              <span className="font-semibold">{stats.totalBookings}</span>
            </span>

            <span className="opacity-50">|</span>

            <span>
              <span className="opacity-80">Active Trip:</span>{" "}
              <span className="font-semibold text-yellow-300">
                {stats.activeTripCount}
              </span>
            </span>

            <span className="opacity-50">|</span>

            <span>
              <span className="opacity-80">Completed:</span>{" "}
              <span className="font-semibold text-green-300">
                {stats.completedCount}
              </span>
            </span>

            <span className="opacity-50">|</span>

            <span>
              <span className="opacity-80">Cancelled:</span>{" "}
              <span className="font-semibold text-red-300">
                {stats.cancelledCount}
              </span>
            </span>

            <span className="opacity-50">|</span>

            <span>
              <span className="opacity-80">Assigned:</span>{" "}
              <span className="font-semibold text-purple-300">
                {stats.assignedCount}
              </span>
            </span>

            <span className="opacity-50">|</span>

            <span>
              <span className="opacity-80">Unassigned:</span>{" "}
              <span className="font-semibold text-gray-300">
                {stats.unassignedCount}
              </span>
            </span>

            <span className="opacity-50">|</span>

            <span>
              <span className="opacity-80">Pending Payment:</span>{" "}
              <span className="font-semibold text-orange-300">
                {stats.pendingPaymentCount}
              </span>
            </span>

          </div>
        )}

      </div>

      {/* ✅ FIXED FILTER */}
      <BookingFilter
        appliedFilters={filters}   // ⭐ IMPORTANT FIX
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="flex justify-between mb-6">
        <div />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={exportExcel}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          {isExporting ? <LoderBtn /> : "Export Excel"}
        </motion.button>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>BOOKING</StyledTableCell>
              <StyledTableCell>INFORMATION</StyledTableCell>
              <StyledTableCell>BOOKING TYPE</StyledTableCell>
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
                <TableCell colSpan={8} align="center">
                  No Bookings Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.bookingNumber}</TableCell>

                  <TableCell>
                    <div className="font-medium text-gray-800">
                      {row.user?.name || "_"}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      PickUp:- {row.pickup?.address || "-"}
                    </div>

                    <div className="text-xs text-gray-500">
                      Drop:- {row.dropoff?.address || "-"}
                    </div>

                    <div className="text-xs text-blue-600 mt-1">
                      Pickup Date: {row.tripStartAtIST || "-"}
                    </div>

                    <div className="text-xs text-green-600">
                      Drop date: {row.tripEndAtIST || "-"}
                    </div>
                  </TableCell>

                  <TableCell>{row.bookingType || "-"}</TableCell>
                  <TableCell>{row.tripStatus || "-"}</TableCell>
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

                        {/* ✅ HIDE REASSIGN IF TRIP COMPLETED */}
                        {row.tripStatus?.toLowerCase() !== "completed" && (
                          <button
                            onClick={() =>
                              handleReassignDriver(
                                row._id,
                                row.segment?._id
                              )
                            }
                            className="mt-1 text-xs bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Reassign
                          </button>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                    {/* {row.driver ? (
                      <>
                        {row.driver.name || "-"}<br />
                        {row.driver.phone || "-"}<br />

                       
                        <button
                          onClick={() => handleReassignDriver(row._id, row.segment?._id)}
                          className="mt-1 text-xs bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Reassign
                        </button>
                      </>
                    ) : (
                      "-"
                    )} */}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row._id)}>
                      <MoreVertIcon />
                    </IconButton>

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
                              handleAssignDriver(
                                row._id,
                                row.segment?._id
                              )
                            }
                          >
                            🚗 Assign Chauffeur
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
        <Stack alignItems="center" mt={5}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Stack>
      )}

      {/* MODAL */}
      <Modal
        title="Assign Chauffeur"
        // open={isAssignModalOpen}
        open={isAssignModalOpen || isReassignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
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