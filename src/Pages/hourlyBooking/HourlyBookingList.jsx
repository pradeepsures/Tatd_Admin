import * as React from "react";
import { useEffect, useState } from "react";

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
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { Modal } from "antd";

import toast from "react-hot-toast";

import * as XLSX from "xlsx";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import { getAllHourlyBookings } from "../../Services/HourlyBookingApi";

import HourlyBookingFilters from "../hourlyBooking/HourlyBookingFilter";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// TABLE STYLE
// ─────────────────────────────────────────────

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "14px",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },

  "&:hover": {
    backgroundColor: "#f3f4f6",
  },
}));

// ─────────────────────────────────────────────
// FORMAT TEXT
// ─────────────────────────────────────────────

const formatText = (text) => {
  if (!text) return "-";

  return text
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function HourlyBookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const rowsPerPage = 15;

  const [totalPages, setTotalPages] = useState(1);

  // MENU
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [stats, setStats] = useState(null);

  // FILTERS
  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: "",
    endDate: "",

    overallStatus: "",
    tripStatus: "",
    paymentStatus: "",
    assignmentStatus: "",
    tripType: "",

    driverId: "",
    driverName: "",
    driverPhone: "",
  });

  // ─────────────────────────────────────────────
  // FETCH BOOKINGS
  // ─────────────────────────────────────────────

  // const fetchBookings = async () => {
  //   try {
  //     setLoading(true);

  //     const result = await getAllHourlyBookings({
  //       page,
  //       rowsPerPage,
  //       ...filters,
  //     });

  //     if (result?.status) {
  //       setBookings(result.data || []);
  //       setTotalPages(result.totalPage || 1);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to load bookings");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const result = await getAllHourlyBookings({
        page,
        rowsPerPage,
        ...filters,
      });

      if (result?.status) {
        setBookings(result.data || []);
        setTotalPages(result.totalPage || 1);

        // ✅ ADD THIS
        setStats(result.stats || null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, filters]);

  // ─────────────────────────────────────────────
  // EXPORT EXCEL
  // ─────────────────────────────────────────────

  const handleExportExcel = () => {
    if (bookings.length === 0) {
      toast.error("No data found");
      return;
    }

    const excelData = bookings.map((item, index) => ({
      SR: index + 1,
      BookingNumber: item.bookingNumber,
      Customer: item.user?.name,
      TripType: formatText(item.tripType),
      Hours: item.bookedHours,
      Fare: item.estimatedFare,
      Pickup: item.pickup?.address,
      PaymentStatus: formatText(item.paymentStatus),
      TripStatus: formatText(item.tripStatus),
      AssignmentStatus: formatText(item.assignmentStatus),
      Date: item.scheduledAtIST,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Hourly Bookings");

    XLSX.writeFile(workbook, "Hourly_Bookings.xlsx");

    toast.success("Excel exported successfully");
  };

  // ─────────────────────────────────────────────
  // MENU
  // ─────────────────────────────────────────────

  const openMenu = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // ─────────────────────────────────────────────
  // LOADER
  // ─────────────────────────────────────────────

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <Breaker />

        {/* EXPORT BUTTON */}
        <button
          onClick={handleExportExcel}
          className="
            flex items-center gap-2
            bg-green-600 hover:bg-green-700
            text-white
            px-5 py-2
            rounded-lg
            shadow
            transition
          "
        >
          <FileDownloadIcon />
          Export Excel
        </button>
      </div>

      {/* STATS BAR */}
      {/* STATS CARD (RIGHT SIDE, COMPACT) */}
      {stats && (
        <div className="flex justify-end mb-4">
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white shadow-md rounded-xl px-4 py-3 text-sm w-fit">
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
              <span>
                <span className="opacity-80">Total:</span>{" "}
                <span className="font-semibold">{stats.totalBookings}</span>
              </span>

              <span className="opacity-40">|</span>

              <span>
                <span className="opacity-80">Active:</span>{" "}
                <span className="font-semibold text-yellow-300">
                  {stats.activeTripCount}
                </span>
              </span>

              <span className="opacity-40">|</span>

              <span>
                <span className="opacity-80">Completed:</span>{" "}
                <span className="font-semibold text-green-300">
                  {stats.completedCount}
                </span>
              </span>

              <span className="opacity-40">|</span>

              <span>
                <span className="opacity-80">Cancelled:</span>{" "}
                <span className="font-semibold text-red-300">
                  {stats.cancelledCount}
                </span>
              </span>

              <span className="opacity-40">|</span>

              <span>
                <span className="opacity-80">Assigned:</span>{" "}
                <span className="font-semibold text-purple-300">
                  {stats.assignedCount}
                </span>
              </span>

              <span className="opacity-40">|</span>

              <span>
                <span className="opacity-80">Unassigned:</span>{" "}
                <span className="font-semibold text-gray-300">
                  {stats.unassignedCount}
                </span>
              </span>

              <span className="opacity-40">|</span>

              <span>
                <span className="opacity-80">Pending Payment:</span>{" "}
                <span className="font-semibold text-orange-300">
                  {stats.pendingPaymentCount}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <HourlyBookingFilters filters={filters} setFilters={setFilters} />

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          {/* HEAD */}
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>

              {/* BOOKING + PAYMENT (reduced width feel) */}
              <StyledTableCell sx={{ minWidth: 140 }}>
                BOOKING No.&PAYMENT
              </StyledTableCell>

              {/* INFORMATION (moved up) */}
              <StyledTableCell sx={{ minWidth: 260 }}>
                INFORMATION
              </StyledTableCell>

              {/* TRIP + FARE */}
              <StyledTableCell>TRIP TYPE</StyledTableCell>

              {/* VEHICLE */}
              <StyledTableCell>VEHICLE PREF. Category</StyledTableCell>

              <StyledTableCell>TRIP STATUS</StyledTableCell>

              <StyledTableCell>ASSIGNMENT</StyledTableCell>

              <StyledTableCell>DRIVER INFO</StyledTableCell>

              <StyledTableCell align="center">ACTION</StyledTableCell>
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking, index) => (
                <StyledTableRow key={booking._id}>
                  {/* S.NO */}
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>

                  {/* BOOKING + PAYMENT (compact) */}
                  <StyledTableCell sx={{ minWidth: 140 }}>
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-gray-800 truncate">
                        {booking.bookingNumber}
                      </div>

                      <span
                        className={`
                    px-2 py-0.5 rounded-full text-[11px] font-semibold
                    ${
                      booking.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                      >
                        {formatText(booking.paymentStatus)}
                      </span>
                    </div>
                  </StyledTableCell>

                  {/* INFORMATION (pickup + drop moved here) */}
                  <StyledTableCell sx={{ minWidth: 260 }}>
                    <div className="space-y-2">
                      {/* USER */}
                      <div className="text-xs text-gray-700 font-medium truncate">
                        {formatText(booking.user?.name)}
                      </div>

                      {/* PICKUP */}
                      <div className="flex gap-2 items-start">
                        <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Pickup:-
                        </span>
                        <div className="text-xs text-gray-600 break-words">
                          {booking.pickup?.address}
                        </div>
                      </div>

                      {/* DROP */}
                      <div className="flex gap-2 items-start">
                        <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Drop:-
                        </span>
                        <div className="text-xs text-gray-600 break-words">
                          {booking.dropoff?.address}
                        </div>
                      </div>

                      {/* TIME */}
                      <div className="text-[10px] text-gray-500">
                        <span className="font-semibold text-gray-600">
                          Pickup Time:-
                        </span>{" "}
                        {booking.scheduledAtIST}
                      </div>
                    </div>
                  </StyledTableCell>

                  {/* TRIP + FARE */}
                  <StyledTableCell>
                    <div className="space-y-2 min-w-[120px]">
                      <span
                        className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      booking.tripType === "round_trip"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }
                  `}
                      >
                        {formatText(booking.tripType)}
                      </span>

                      {/* <div className="font-semibold text-sm text-gray-800">
                        ₹{booking.estimatedFare}
                      </div> */}
                    </div>
                  </StyledTableCell>

                  {/* VEHICLE */}
                  <StyledTableCell>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                      {booking.vechiclePreferenceCategory?.name}
                    </span>
                  </StyledTableCell>

                  {/* TRIP STATUS */}
                  <StyledTableCell>
                    <span
                      className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    booking.tripStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }
                `}
                    >
                      {formatText(booking.tripStatus)}
                    </span>
                  </StyledTableCell>

                  {/* ASSIGNMENT */}
                  <StyledTableCell>
                    <span
                      className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    booking.assignmentStatus === "assigned"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
                    >
                      {formatText(booking.assignmentStatus)}
                    </span>
                  </StyledTableCell>

                  {/* DRIVER INFO */}
                  <StyledTableCell>
                    {booking.driver ? (
                      <div className="flex items-center gap-3">
                        {/* PROFILE PIC */}
                        <img
                          src={
                            booking.driver.profilePic ||
                            "https://via.placeholder.com/40"
                          }
                          alt="driver"
                          className="w-10 h-10 rounded-full object-cover border"
                        />

                        {/* DETAILS */}
                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-gray-800">
                            {booking.driver.name}
                          </div>

                          <div className="text-gray-500">
                            {booking.driver.phone}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Not Assigned
                      </span>
                    )}
                  </StyledTableCell>

                  {/* ACTION */}
                  <StyledTableCell align="center">
                    <IconButton onClick={(e) => openMenu(e, booking)}>
                      <MoreVertIcon />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Stack alignItems="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
          color="primary"
        />
      </Stack>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            navigate(`/home/hourlyBooking/view/${selectedItem._id}`);
          }}
        >
          <VisibilityIcon fontSize="small" className="mr-2 text-green-600" />
          View
        </MenuItem>
      </Menu>
    </div>
  );
}
