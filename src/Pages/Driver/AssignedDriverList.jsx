import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { styled } from "@mui/material/styles";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import { Select } from "antd";

import toast from "react-hot-toast";
import * as XLSX from "xlsx";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import { getAssignedHourlyDrivers } from "../../Services/HourlyBookingApi";

// ───────────────────────────────
// TABLE STYLE
// ───────────────────────────────

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: "0.82rem",
    padding: "14px 12px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderBottom: "none",
  },

  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.88rem",
    padding: "16px 12px",
    verticalAlign: "top",
    borderBottom: "1px solid #edf2f7",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },

  "&:hover": {
    backgroundColor: "#eef4ff",
    transition: "0.2s",
  },
}));

export default function AssignedDriversList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);

  // FILTERS
  const [tripStatus, setTripStatus] = useState("");
  const [tempTripStatus, setTempTripStatus] = useState("");

  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ───────────────────────────────
  // FORMAT TEXT
  // ───────────────────────────────

  const formatText = (text) => {
    if (!text) return "—";

    return text
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ───────────────────────────────
  // STATUS COLOR
  // ───────────────────────────────

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "arrived":
        return "bg-yellow-100 text-yellow-700";

      case "not_started":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ───────────────────────────────
  // FETCH DATA
  // ───────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAssignedHourlyDrivers({
        page,
        limit: rowsPerPage,
        tripStatus,
        startDate,
        endDate,
      });

      if (res?.status) {
        let filtered = res.data || [];

        // SEARCH FILTER
        if (search) {
          filtered = filtered.filter((item) => {
            const keyword = search.toLowerCase();

            return (
              item.bookingNumber
                ?.toLowerCase()
                .includes(keyword) ||
              item.driver?.name
                ?.toLowerCase()
                .includes(keyword) ||
              item.driver?.phone
                ?.toLowerCase()
                .includes(keyword) ||
              item.pickup?.address
                ?.toLowerCase()
                .includes(keyword) ||
              item.dropoff?.address
                ?.toLowerCase()
                .includes(keyword)
            );
          });
        }

        setData(filtered);
        setTotalPages(res.totalPage || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned drivers");
    } finally {
      setLoading(false);
    }
  }, [page, tripStatus, startDate, endDate, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ───────────────────────────────
  // APPLY FILTERS
  // ───────────────────────────────

  const applyFilters = () => {
    setTripStatus(tempTripStatus);
    setSearch(tempSearch);
    setPage(1);
  };

  // ───────────────────────────────
  // CLEAR FILTERS
  // ───────────────────────────────

  const clearFilters = () => {
    setTempTripStatus("");
    setTripStatus("");

    setTempSearch("");
    setSearch("");

    setStartDate("");
    setEndDate("");

    setPage(1);
  };

  // ───────────────────────────────
  // EXPORT EXCEL
  // ───────────────────────────────

  const exportToExcel = async () => {
    try {
      const res = await getAssignedHourlyDrivers({
        page: 1,
        limit: 100000,
        tripStatus,
        startDate,
        endDate,
      });

      if (!res?.status || !res?.data?.length) {
        toast.error("No data found");
        return;
      }

      const excelData = res.data.map((row, index) => ({
        "S.No": index + 1,

        "Booking Number": row.bookingNumber || "—",

        "Trip Type": formatText(row.tripType),

        "Booked Hours": row.bookedHours || "—",

        "Estimated Fare": row.estimatedFare || 0,

        "Vehicle Category":
          row.vechiclePreferenceCategory?.name || "—",

        "Vehicle Type":
          row.vechiclePreferenceCategory?.vehiclePreference
            ?.name || "—",

        "Pickup Address": row.pickup?.address || "—",

        "Pickup Latitude": row.pickup?.lat || "—",

        "Pickup Longitude": row.pickup?.lng || "—",

        "Drop Address": row.dropoff?.address || "—",

        "Drop Latitude": row.dropoff?.lat || "—",

        "Drop Longitude": row.dropoff?.lng || "—",

        "Driver Name": row.driver?.name || "—",

        "Driver Phone": row.driver?.phone || "—",

        "Driver Rating": row.driver?.rating || "—",

        "Driver Online":
          row.driver?.isOnline ? "Online" : "Offline",

        "Driver Available":
          row.driver?.isAvailable ? "Available" : "Busy",

        "Driver Verified":
          row.driver?.isVerified ? "Yes" : "No",

        "Assignment Status":
          formatText(row.assignmentStatus),

        "Trip Status": formatText(row.tripStatus),

        "Overall Status":
          formatText(row.overallStatus),

        "Scheduled Time":
          row.scheduledAtIST || "—",
      }));

      const worksheet =
        XLSX.utils.json_to_sheet(excelData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Assigned Drivers"
      );

      XLSX.writeFile(
        workbook,
        `Assigned_Drivers_${Date.now()}.xlsx`
      );

      toast.success("Excel exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen w-full overflow-hidden">
      <Breaker />

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 mt-5">
        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 w-full">
          {/* SEARCH */}
          <input
            className="px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full sm:w-[260px]"
            placeholder="Search booking / driver / address"
            value={tempSearch}
            onChange={(e) =>
              setTempSearch(e.target.value)
            }
          />

          {/* STATUS */}
          <Select
            allowClear
            placeholder="Trip Status"
            style={{
              width: 180,
              height: 45,
            }}
            value={tempTripStatus || undefined}
            onChange={(v) =>
              setTempTripStatus(v || "")
            }
          >
            <Select.Option value="not_started">
              Not Started
            </Select.Option>

            <Select.Option value="arrived">
              Arrived
            </Select.Option>

            <Select.Option value="completed">
              Completed
            </Select.Option>
          </Select>

          {/* START DATE */}
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-200"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          {/* END DATE */}
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-200"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />

          {/* APPLY */}
          <button
            onClick={applyFilters}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md"
          >
            Apply
          </button>

          {/* CLEAR */}
          <button
            onClick={clearFilters}
            className="bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md"
          >
            Clear
          </button>

          {/* EXPORT */}
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="bg-white rounded-xl shadow py-20 text-center text-gray-500">
          No Assigned Drivers Found
        </div>
      )}

      {/* TABLE */}
      {data.length > 0 && (
        <div className="w-full overflow-hidden rounded-2xl shadow bg-white">
          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              overflowX: "auto",
              boxShadow: "none",
            }}
          >
            <Table
              sx={{
                minWidth: 1600,
                width: "100%",
                tableLayout: "auto",
              }}
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    S.No
                  </StyledTableCell>

                  <StyledTableCell>
                    Driver Details
                  </StyledTableCell>

                  <StyledTableCell>
                    Booking Details
                  </StyledTableCell>

                  <StyledTableCell>
                    Pickup Location
                  </StyledTableCell>

                  <StyledTableCell>
                    Drop Location
                  </StyledTableCell>

                  <StyledTableCell>
                    Vehicle Details
                  </StyledTableCell>

                  <StyledTableCell>
                    Trip Details
                  </StyledTableCell>

                  <StyledTableCell>
                    Fare
                  </StyledTableCell>

                  <StyledTableCell>
                    Status
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row, i) => (
                  <StyledTableRow key={row._id}>
                    {/* S.NO */}
                    <StyledTableCell>
                      {(page - 1) * rowsPerPage +
                        i +
                        1}
                    </StyledTableCell>

                    {/* DRIVER DETAILS */}
                    <StyledTableCell>
                      <div className="flex gap-3 min-w-[260px]">
                        <img
                          src={
                            row.driver?.profilePic
                          }
                          alt=""
                          className="w-14 h-14 rounded-full object-cover border"
                        />

                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-gray-800">
                            {row.driver?.name ||
                              "—"}
                          </div>

                          <div className="text-xs text-gray-600">
                            {row.driver?.phone ||
                              "—"}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full font-semibold
                              ${
                                row.driver
                                  ?.isOnline
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }
                            `}
                            >
                              {row.driver?.isOnline
                                ? "Online"
                                : "Offline"}
                            </span>

                            <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700">
                              ⭐{" "}
                              {row.driver?.rating ||
                                0}
                            </span>

                            <span
                              className={`text-[10px] px-2 py-1 rounded-full font-semibold
                              ${
                                row.driver
                                  ?.isAvailable
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                            >
                              {row.driver
                                ?.isAvailable
                                ? "Available"
                                : "Busy"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* BOOKING DETAILS */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[220px]">
                        <div className="font-semibold text-gray-800">
                          {
                            row.bookingNumber
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          Scheduled:
                        </div>

                        <div className="text-xs text-gray-700">
                          {row.scheduledAtIST ||
                            "—"}
                        </div>

                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                          {formatText(
                            row.tripType
                          )}
                        </span>
                      </div>
                    </StyledTableCell>

                    {/* PICKUP */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[320px]">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                          Pickup
                        </span>

                        <div className="text-sm text-gray-700 break-words leading-6">
                          {
                            row.pickup?.address
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          Lat:{" "}
                          {row.pickup?.lat}
                        </div>

                        <div className="text-xs text-gray-500">
                          Lng:{" "}
                          {row.pickup?.lng}
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* DROP */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[320px]">
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full">
                          Drop
                        </span>

                        <div className="text-sm text-gray-700 break-words leading-6">
                          {
                            row.dropoff?.address
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          Lat:{" "}
                          {row.dropoff?.lat}
                        </div>

                        <div className="text-xs text-gray-500">
                          Lng:{" "}
                          {row.dropoff?.lng}
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* VEHICLE */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[180px]">
                        <div className="font-semibold text-gray-800">
                          {
                            row
                              .vechiclePreferenceCategory
                              ?.name
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          {
                            row
                              .vechiclePreferenceCategory
                              ?.vehiclePreference
                              ?.name
                          }
                        </div>

                        {row
                          .vechiclePreferenceCategory
                          ?.vehiclePreference
                          ?.image && (
                          <img
                            src={
                              row
                                .vechiclePreferenceCategory
                                ?.vehiclePreference
                                ?.image
                            }
                            alt=""
                            className="w-16 h-16 object-contain"
                          />
                        )}
                      </div>
                    </StyledTableCell>

                    {/* TRIP DETAILS */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[180px]">
                        <div className="text-sm font-medium text-gray-700">
                          Hours:{" "}
                          {row.bookedHours}
                        </div>

                        <div className="text-sm font-medium text-gray-700">
                          Overall:
                        </div>

                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                          {formatText(
                            row.overallStatus
                          )}
                        </span>

                        <div>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                            {formatText(
                              row.assignmentStatus
                            )}
                          </span>
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* FARE */}
                    <StyledTableCell>
                      <div className="font-bold text-green-700 text-lg min-w-[120px]">
                        ₹{" "}
                        {row.estimatedFare}
                      </div>
                    </StyledTableCell>

                    {/* STATUS */}
                    <StyledTableCell>
                      <div className="min-w-[150px]">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                            row.tripStatus
                          )}`}
                        >
                          {formatText(
                            row.tripStatus
                          )}
                        </span>
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* PAGINATION */}
      <Stack alignItems="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
          color="primary"
        />
      </Stack>
    </div>
  );
}