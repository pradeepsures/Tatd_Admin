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
import Button from "@mui/material/Button";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { Modal, Select } from "antd";

import toast from "react-hot-toast";

import * as XLSX from "xlsx";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getAllHourlyBookings,
  getUnassignedHourlyDrivers,
  assignHourlyDriver,
  reassignHourlyDriver,
} from "../../Services/HourlyBookingApi";

import HourlyBookingFilters from "../hourlyBooking/HourlyBookingFilter";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

// ─────────────────────────────────────────────
// TABLE STYLE
// ─────────────────────────────────────────────

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "11px",
    padding: "10px 6px",
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.body}`]: {
    padding: "10px 6px",
    fontSize: "11px",
    color: "#374151",
    verticalAlign: "top",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "normal",
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

  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [driverOptions, setDriverOptions] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driverAction, setDriverAction] = useState("assign");
  const [driverSubmitting, setDriverSubmitting] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

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

  const fetchUnassignedDrivers = async (bookingId, mode = "assign") => {
    try {
      const res = await getUnassignedHourlyDrivers({
        page: 1,
        limit: 100,
        bookingId,
      });

      if (res?.status) {
        setDriverOptions(res.data || []);
        if (!res.data?.length) {
          toast.error(
            mode === "reassign"
              ? "No drivers available for reassignment"
              : "No drivers available for assignment"
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load driver list");
    }
  };

  const openDriverModal = async (booking, mode = "assign") => {
    setActiveBooking(booking);
    setDriverAction(mode);
    setSelectedDriverId("");
    setDriverModalOpen(true);
    await fetchUnassignedDrivers(booking._id, mode);
    closeMenu();
  };

  const handleDriverSubmit = async () => {
    if (!activeBooking?._id) return;
    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    try {
      setDriverSubmitting(true);

      if (driverAction === "reassign") {
        await reassignHourlyDriver({
          bookingId: activeBooking._id,
          driverId: selectedDriverId,
        });
      } else {
        await assignHourlyDriver({
          bookingId: activeBooking._id,
          driverId: selectedDriverId,
        });
      }

      setDriverModalOpen(false);
      setSelectedDriverId("");
      setActiveBooking(null);
      await fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setDriverSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // LOADER
  // ─────────────────────────────────────────────

  if (loading) return <Loader />;

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 bg-gray-50 min-h-screen">
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
      <TableContainer
        component={Paper}
        sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden" }}
      >
        <Table sx={{ width: "100%", minWidth: 1100, tableLayout: "fixed" }}>
          {/* HEAD */}
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>

              {/* BOOKING + PAYMENT (reduced width feel) */}
              <StyledTableCell sx={{ width: "16%" }}>
                BOOKING / PAYMENT
              </StyledTableCell>

              {/* INFORMATION (moved up) */}
              <StyledTableCell sx={{ width: "24%" }}>
                INFORMATION
              </StyledTableCell>

              {/* TRIP + FARE */}
              <StyledTableCell sx={{ width: "9%" }}>TRIP TYPE</StyledTableCell>

              {/* VEHICLE */}
              <StyledTableCell sx={{ width: "10%" }}>
                VEHICLE PREF.
              </StyledTableCell>

              <StyledTableCell sx={{ width: "9%" }}>TRIP STATUS</StyledTableCell>

              <StyledTableCell sx={{ width: "9%" }}>ASSIGNMENT</StyledTableCell>

              <StyledTableCell sx={{ width: "15%" }}>DRIVER INFO</StyledTableCell>

              <StyledTableCell align="center" sx={{ width: "6%" }}>
                ACTION
              </StyledTableCell>
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
                  <StyledTableCell sx={{ width: "16%" }}>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-800 break-all">
                        {booking.bookingNumber}
                      </div>

                      <span
                        className={`
                    px-2 py-0.5 rounded-full text-[11px] font-semibold
                    ${booking.paymentStatus === "paid"
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
                  <StyledTableCell sx={{ width: "24%", minWidth: 0 }}>
                    <div className="space-y-1.5 text-[11px] text-gray-700">
                      <div className="font-semibold text-gray-800 break-all">
                        {formatText(booking.user?.name)}
                      </div>

                      <div className="rounded-md bg-green-50 p-1.5">
                        <div className="text-[10px] font-semibold text-green-700">Pickup</div>
                        <div className="text-[11px] text-gray-700 break-all">{booking.pickup?.address || "-"}</div>
                        <div className="text-[10px] text-gray-500">Lat: {booking.pickup?.lat ?? "-"} • Lng: {booking.pickup?.lng ?? "-"}</div>
                      </div>

                      <div className="rounded-md bg-red-50 p-1.5">
                        <div className="text-[10px] font-semibold text-red-700">Drop</div>
                        <div className="text-[11px] text-gray-700 break-all">{booking.dropoff?.address || "-"}</div>
                        <div className="text-[10px] text-gray-500">Lat: {booking.dropoff?.lat ?? "-"} • Lng: {booking.dropoff?.lng ?? "-"}</div>
                      </div>

                      <div className="text-[10px] text-gray-500">
                        <span className="font-semibold text-gray-600">Pickup Time:</span> {booking.scheduledAtIST || "-"}
                      </div>
                    </div>
                  </StyledTableCell>

                  {/* TRIP + FARE */}
                  <StyledTableCell>
                    <div className="space-y-1.5 w-full">
                      <span
                        className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${booking.tripType === "round_trip"
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
                  ${booking.tripStatus === "completed"
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
                  ${booking.assignmentStatus === "assigned"
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
                      <div className="space-y-2">
                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-gray-800">
                            {[booking.driver.name, booking.driver.midName, booking.driver.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </div>
                          <div className="text-gray-600">{booking.driver.email}</div>
                          <div className="text-gray-600">{booking.driver.phone}</div>
                        </div>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PersonAddAltIcon />}
                          onClick={() => openDriverModal(booking, "reassign")}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #eb252f, #9e2626)",
                            boxShadow: "none",
                            fontSize: "11px",
                            py: 0.4,
                            px: 1.2,
                          }}
                        >
                          Reassign
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-gray-400 text-xs">Not Assigned</span>
                      </div>
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

        {selectedItem?.assignmentStatus !== "assigned" && (
          <MenuItem onClick={() => openDriverModal(selectedItem, "assign")}>
            <PersonAddAltIcon fontSize="small" className="mr-2 text-blue-600" />
            Assign Driver
          </MenuItem>
        )}
      </Menu>

      <Modal
        title={driverAction === "reassign" ? "Reassign Driver" : "Assign Driver"}
        open={driverModalOpen}
        onCancel={() => {
          setDriverModalOpen(false);
          setSelectedDriverId("");
          setActiveBooking(null);
        }}
        onOk={handleDriverSubmit}
        confirmLoading={driverSubmitting}
        okText={driverAction === "reassign" ? "Reassign Driver" : "Assign Driver"}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {activeBooking?.bookingNumber || "Select a driver for this booking."}
          </p>
          <Select
            showSearch
            placeholder="Select driver"
            className="w-full"
            value={selectedDriverId || undefined}
            onChange={(value) => setSelectedDriverId(value)}
            optionFilterProp="children"
          >
            {driverOptions.map((driver) => (
              <Option key={driver._id} value={driver._id}>
                {driver.name} {driver.phone ? `- ${driver.phone}` : ""}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
