import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
    background: "#111827",
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    padding: "14px 12px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(16,24,40,0.08)",
  },

  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.88rem",
    padding: "16px 12px",
    verticalAlign: "top",
    color: "#334155",
    borderBottom: "1px solid rgba(226,232,240,0.7)",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(248,250,252,0.45)",
  },

  "&:hover": {
    backgroundColor: "rgba(16,24,40,0.08)",
    transition: "0.2s",
  },
}));

export default function AssignedDriversList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);

  // FILTERS
  const [tripStatus, setTripStatus] = useAdminListState("tripStatus", "");
  const [tempTripStatus, setTempTripStatus] = useAdminListState("tempTripStatus", "");

  const [search, setSearch] = useAdminListState("search", "");
  const [tempSearch, setTempSearch] = useAdminListState("tempSearch", "");

  const [startDate, setStartDate] = useAdminListState("startDate", "");
  const [endDate, setEndDate] = useAdminListState("endDate", "");

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
        return "badge-success";

      case "arrived":
        return "badge-warning";

      case "not_started":
        return "badge-info";

      case "cancelled":
        return "badge-danger";

      default:
        return "badge-neutral";
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
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Drivers</h1>
        </div>
      </div>

      {/* HEADER */}
      <div className="card card-pad">
        {/* FILTERS */}
        <div className="flex w-full flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
          {/* SEARCH */}
          <input
            className="field h-11 w-full border sm:w-[260px]"
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
            className="w-full sm:!w-[180px]"
            style={{
              height: 44,
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
            className="field h-11 w-full border sm:w-auto"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          {/* END DATE */}
          <input
            type="date"
            className="field h-11 w-full border sm:w-auto"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />

          {/* APPLY */}
          <button
            onClick={applyFilters}
            className="btn-primary h-11 w-full px-6 sm:w-auto"
          >
            Apply
          </button>

          {/* CLEAR */}
          <button
            onClick={clearFilters}
            className="btn-secondary h-11 w-full px-6 sm:w-auto"
          >
            Clear
          </button>

          {/* EXPORT */}
          <button
            onClick={exportToExcel}
            className="btn-success h-11 w-full px-6 sm:ml-auto sm:w-auto"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="card py-14 text-center text-slate-400">
          No Assigned Drivers Found
        </div>
      )}

      {/* TABLE */}
      {data.length > 0 && (
        <div className="w-full overflow-hidden">
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
                          className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/5"
                        />

                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-slate-800">
                            {row.driver?.name ||
                              "—"}
                          </div>

                          <div className="text-xs text-slate-600">
                            {row.driver?.phone ||
                              "—"}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`text-[10px]
                              ${
                                row.driver
                                  ?.isOnline
                                  ? "badge-success"
                                  : "badge-neutral"
                              }
                            `}
                            >
                              {row.driver?.isOnline
                                ? "Online"
                                : "Offline"}
                            </span>

                            <span className="badge-warning text-[10px]">
                              ⭐{" "}
                              {row.driver?.rating ||
                                0}
                            </span>

                            <span
                              className={`text-[10px]
                              ${
                                row.driver
                                  ?.isAvailable
                                  ? "badge-info"
                                  : "badge-danger"
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
                        <div className="font-semibold text-slate-800">
                          {
                            row.bookingNumber
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          Scheduled:
                        </div>

                        <div className="text-xs text-slate-700">
                          {row.scheduledAtIST ||
                            "—"}
                        </div>

                        <span className="badge-info">
                          {formatText(
                            row.tripType
                          )}
                        </span>
                      </div>
                    </StyledTableCell>

                    {/* PICKUP */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[320px]">
                        <span className="badge-success text-[10px] uppercase tracking-wide">
                          Pickup
                        </span>

                        <div className="text-sm text-slate-700 break-words leading-6">
                          {
                            row.pickup?.address
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          Lat:{" "}
                          {row.pickup?.lat}
                        </div>

                        <div className="text-xs text-slate-500">
                          Lng:{" "}
                          {row.pickup?.lng}
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* DROP */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[320px]">
                        <span className="badge-danger text-[10px] uppercase tracking-wide">
                          Drop
                        </span>

                        <div className="text-sm text-slate-700 break-words leading-6">
                          {
                            row.dropoff?.address
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          Lat:{" "}
                          {row.dropoff?.lat}
                        </div>

                        <div className="text-xs text-slate-500">
                          Lng:{" "}
                          {row.dropoff?.lng}
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* VEHICLE */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[180px]">
                        <div className="font-semibold text-slate-800">
                          {
                            row
                              .vechiclePreferenceCategory
                              ?.name
                          }
                        </div>

                        <div className="text-xs text-slate-500">
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
                            className="h-16 w-16 rounded-xl bg-white/70 object-contain p-1 ring-1 ring-black/5"
                          />
                        )}
                      </div>
                    </StyledTableCell>

                    {/* TRIP DETAILS */}
                    <StyledTableCell>
                      <div className="space-y-2 min-w-[180px]">
                        <div className="text-sm font-medium text-slate-700">
                          Hours:{" "}
                          {row.bookedHours}
                        </div>

                        <div className="text-sm font-medium text-slate-700">
                          Overall:
                        </div>

                        <span className="badge-neutral">
                          {formatText(
                            row.overallStatus
                          )}
                        </span>

                        <div>
                          <span className="badge-success">
                            {formatText(
                              row.assignmentStatus
                            )}
                          </span>
                        </div>
                      </div>
                    </StyledTableCell>

                    {/* FARE */}
                    <StyledTableCell>
                      <div className="min-w-[120px] whitespace-nowrap text-base font-semibold text-slate-900">
                        ₹{" "}
                        {row.estimatedFare}
                      </div>
                    </StyledTableCell>

                    {/* STATUS */}
                    <StyledTableCell>
                      <div className="min-w-[150px]">
                        <span
                          className={`whitespace-nowrap ${getStatusColor(
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
      <Stack alignItems="center" mt={2}>
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