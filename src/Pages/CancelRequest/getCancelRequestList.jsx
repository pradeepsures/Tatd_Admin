
import React, { useState, useEffect, useCallback } from "react";
import useAdminListState from "../../hooks/useAdminListState";

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
import { Modal, Input, Select } from "antd";
import { motion } from "framer-motion";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import { StyledTableCell } from "../../compoents/TableComponents";

import {
  getCancelRequestsApi,
  getRejectedAssignmentsApi,
  approveCancelRequestApi,
  rejectCancelRequestApi,
  reassignCancelRequestApi,
} from "../../Services/RequestApi";

import { getAllDrivers } from "../../Services/DriverApi";

const { Option } = Select;

const ROWS_PER_PAGE = 7;

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "badge-success";
    case "rejected":
      return "badge-danger";
    case "confirmed":
      return "badge-success";
    case "cancelled":
    case "canceled":
      return "badge-danger";
    case "pending":
      return "badge-warning";
    default:
      return "badge-warning";
  }
};

const getVehicleName = (vehicle) => {
  if (!vehicle) return "—";

  return [vehicle.carBrand, vehicle.carModel]
    .filter(Boolean)
    .join(" ") || "—";
};

export default function CancelRequestList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // MODAL STATES
  const [actionType, setActionType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [adminNote, setAdminNote] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");

  // DRIVERS
  const [drivers, setDrivers] = useState([]);
  const [driverSearch, setDriverSearch] = useState("");

  // EXPORT
  const [isExporting, setIsExporting] = useState(false);

  // =========================================================
  // NORMALIZE REJECTED ASSIGNMENT RESPONSE
  // =========================================================
  const normalizeRejectedAssignment = (row) => {
    const history = row.assignment?.history || [];

    const rejectedHistory = [...history]
      .reverse()
      .find((item) => item.action === "rejected");

    const assignedHistory = [...history]
      .reverse()
      .find((item) => item.action === "assigned");

    const booking =
      row.booking ||
      (typeof row.bookingId === "object"
        ? row.bookingId
        : row);

    return {
      ...row,

      _recordType: "rejected-assignment",

      booking,

      bookingNumber:
        row.bookingNumber ||
        (typeof row.bookingId === "string"
          ? row.bookingId
          : booking?.bookingNumber || ""),

      driver:
        row.driver ||
        (typeof row.driverId === "object"
          ? row.driverId
          : null),

      rejectedDriverId:
        rejectedHistory?.driver ||
        assignedHistory?.driver ||
        row.driverId ||
        null,

      reason:
        row.reason ||
        row.rejectionReason ||
        row.assignment?.rejectionReason ||
        rejectedHistory?.reason ||
        "Driver rejected assignment",

      status:
        row.assignment?.status ||
        row.status ||
        "rejected",

      requestedAt:
        rejectedHistory?.timestamp ||
        row.rejectedAt ||
        row.requestedAt ||
        row.updatedAt ||
        row.createdAt,

      cityName: row.city?.name || "—",

      pickupAddress: row.pickup?.address || "—",

      vehicleName: getVehicleName(row.vehicle),

      amount:
        row.payment?.paidAmount ??
        row.pricing?.totalAmount ??
        0,

      paymentStatus: row.payment?.status || "—",

      premiumPrice: row.premiumDriver?.opted
        ? Number(row.premiumDriver?.price || 0)
        : 0,

      premiumOpted: Boolean(row.premiumDriver?.opted),

      bookingType: row.bookingType || "—",

      tripType: row.tripType || "—",

      duration:
        row.package?.hours
          ? `${row.package.hours} hours`
          : row.package?.days
            ? `${row.package.days} days`
            : row.package?.basis || "—",

      startDate: row.startDate,

      startTime: row.startTime,

      rejectionHistory: history,
    };
  };

  // =========================================================
  // FETCH DATA
  // =========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        cancelRequestsResult,
        rejectedAssignmentsResult,
      ] = await Promise.all([
        getCancelRequestsApi().catch((error) => {
          console.error("Cancel requests API:", error);
          return null;
        }),

        getRejectedAssignmentsApi().catch((error) => {
          console.error("Rejected assignments API:", error);
          return null;
        }),
      ]);

      const cancelRequests =
        cancelRequestsResult?.status
          ? (cancelRequestsResult.data || []).map((row) => ({
            ...row,
            _recordType: "cancel-request",
            booking: row.booking || row,
            bookingNumber:
              row.booking?.bookingNumber ||
              row.bookingNumber ||
              row.booking?.bookingId ||
              "—",
            reason:
              row.reason ||
              row.cancellationReason ||
              row.cancelReason ||
              "—",
            requestedAt:
              row.requestedAt ||
              row.createdAt ||
              row.updatedAt,
          }))
          : [];

      const rejectedAssignments =
        rejectedAssignmentsResult?.status
          ? (rejectedAssignmentsResult.data || []).map(
            normalizeRejectedAssignment
          )
          : [];

      setData([...cancelRequests, ...rejectedAssignments]);

      if (
        !cancelRequestsResult?.status &&
        !rejectedAssignmentsResult?.status
      ) {
        toast.error("Failed to load requests.");
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
      toast.error(error.message || "Failed to fetch requests");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================================
  // FETCH DRIVERS
  // =========================================================
  const fetchDrivers = async (search = "") => {
    try {
      const res = await getAllDrivers({
        page: 1,
        rowsPerPage: 50,
        searchQuery: search,
      });

      if (res?.status) {
        setDrivers(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Driver load failed");
    }
  };

  useEffect(() => {
    if (actionType === "reassign") {
      fetchDrivers(driverSearch);
    }
  }, [actionType, driverSearch]);

  // =========================================================
  // ACTION MENU
  // =========================================================
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // =========================================================
  // OPEN MODAL
  // =========================================================
  const openModal = (type) => {
    if (!selectedRow) return;

    setActionType(type);
    setModalOpen(true);
    setAdminNote("");
    setSelectedDriver("");
    handleMenuClose();
  };

  // =========================================================
  // SUBMIT ACTION
  // =========================================================
  const handleSubmit = async () => {
    if (!selectedRow) return;

    if (
      (actionType === "approve" || actionType === "reject") &&
      !adminNote.trim()
    ) {
      toast.error("Enter admin note");
      return;
    }

    if (actionType === "reassign" && !selectedDriver) {
      toast.error("Select driver");
      return;
    }

    try {
      setLoading(true);

      let res;

      if (actionType === "approve") {
        res = await approveCancelRequestApi(
          selectedRow._id,
          adminNote
        );
      }

      if (actionType === "reject") {
        res = await rejectCancelRequestApi(
          selectedRow._id,
          adminNote
        );
      }

      if (actionType === "reassign") {
        res = await reassignCancelRequestApi(
          selectedRow.booking?._id ||
          selectedRow.booking?._id ||
          selectedRow._id,
          selectedDriver
        );
      }

      if (res?.status) {
        toast.success(res.message || "Action completed successfully");

        setModalOpen(false);
        setSelectedRow(null);
        setAdminNote("");
        setSelectedDriver("");

        await fetchData();
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch (error) {
      console.error("Action error:", error);
      toast.error(error.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EXCEL EXPORT
  // =========================================================
  const exportExcel = () => {
    if (!data.length) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);

    const exportData = [
      {
        sheet: "Requests",

        columns: [
          {
            label: "Booking ID",
            value: (row) =>
              row.booking?.bookingNumber ||
              row.bookingNumber ||
              row.booking?.bookingId ||
              row.bookingId ||
              "—",
          },

          {
            label: "Customer",
            value: (row) => row.booking?.user?.name || row.user?.name || "—",
          },

          {
            label: "City",
            value: (row) => row.cityName || row.booking?.city?.name || row.city?.name || "—",
          },

          {
            label: "Pickup",
            value: (row) =>
              row.pickupAddress ||
              row.booking?.pickup?.address ||
              row.pickup?.address ||
              "—",
          },

          {
            label: "Vehicle",
            value: (row) =>
              row.vehicleName ||
              getVehicleName(row.booking?.vehicle || row.vehicle),
          },

          {
            label: "Driver",
            value: (row) =>
              row.driver?.name || row.rejectedDriverId || "—",
          },

          {
            label: "Driver Phone",
            value: (row) => row.driver?.phone || "—",
          },

          {
            label: "Reason",
            value: "reason",
          },

          {
            label: "Amount",
            value: (row) =>
              row.amount ??
              row.booking?.payment?.paidAmount ??
              row.booking?.pricing?.totalAmount ??
              "—",
          },

          {
            label: "Payment Status",
            value: (row) =>
              row.paymentStatus ||
              row.booking?.payment?.status ||
              "—",
          },

          {
            label: "Premium Driver",
            value: (row) => row.premiumOpted ? "Yes" : "No",
          },

          {
            label: "Premium Price",
            value: (row) => row.premiumPrice || 0,
          },

          {
            label: "Status",
            value: "status",
          },

          {
            label: "Request Type",
            value: (row) =>
              row._recordType === "rejected-assignment"
                ? "Driver Rejected"
                : "Cancel Request",
          },

          {
            label: "Date",
            value: (row) => formatDate(row.requestedAt),
          },
        ],

        content: data,
      },
    ];

    try {
      xlsx(exportData, {
        fileName: "Driver_Cancel_And_Rejected_Requests",
      });

      toast.success("Excel exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Excel export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // =========================================================
  // PAGINATION
  // =========================================================
  const totalPages = Math.max(
    1,
    Math.ceil(data.length / ROWS_PER_PAGE)
  );

  const paginatedData = data.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  // =========================================================
  // SUMMARY
  // =========================================================
  const rejectedCount = data.filter(
    (row) => row._recordType === "rejected-assignment"
  ).length;

  const cancelCount = data.filter(
    (row) => row._recordType === "cancel-request"
  ).length;

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) return <Loader />;

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="page-shell">
      {/* HEADER */}
      <div className="page-header">
        <div className="max-w-2xl">
          <h1 className="page-title">
            Driver Cancel & Rejected Requests
          </h1>

          <p className="page-subtitle">
            Manage cancellation requests and bookings rejected by
            assigned drivers.
          </p>
        </div>

        <div className="page-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportExcel}
            disabled={isExporting}
            className="btn-secondary"
          >
            {isExporting ? "Exporting..." : "Export Excel"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="btn-secondary"
          >
            Refresh
          </motion.button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card card-pad">
          <p className="detail-label">Total Requests</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data.length}
          </p>
        </div>

        <div className="card card-pad">
          <p className="detail-label">Cancellation Requests</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {cancelCount}
          </p>
        </div>

        <div className="card card-pad">
          <p className="detail-label">Driver Rejections</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        className="overflow-hidden !rounded-xl"
      >
        <Table sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Booking</StyledTableCell>
              <StyledTableCell>Customer</StyledTableCell>
              <StyledTableCell>City / Pickup</StyledTableCell>
              <StyledTableCell>Vehicle</StyledTableCell>
              <StyledTableCell>Driver</StyledTableCell>
              <StyledTableCell>Reason</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!paginatedData.length ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  align="center"
                  className="!py-14 !text-slate-400"
                >
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const booking = row.booking || row;

                const bookingNumber =
                  booking.bookingNumber ||
                  row.bookingNumber ||
                  booking.bookingId ||
                  row.bookingId ||
                  "—";

                const customerName =
                  booking.user?.name ||
                  row.user?.name ||
                  "—";

                const city =
                  row.cityName ||
                  booking.city?.name ||
                  row.city?.name ||
                  "—";

                const pickup =
                  row.pickupAddress ||
                  booking.pickup?.address ||
                  row.pickup?.address ||
                  "—";

                const vehicle =
                  row.vehicleName ||
                  getVehicleName(
                    booking.vehicle || row.vehicle
                  );

                const amount =
                  row.amount ??
                  booking.payment?.paidAmount ??
                  booking.pricing?.totalAmount ??
                  0;

                return (
                  <TableRow
                    key={`${row._recordType}-${row._id}`}
                    hover
                    className="transition-colors"
                  >
                    {/* SERIAL */}
                    <TableCell>
                      {(page - 1) * ROWS_PER_PAGE + index + 1}
                    </TableCell>

                    {/* BOOKING */}
                    <TableCell>
                      <div className="whitespace-nowrap font-semibold text-slate-900">
                        {bookingNumber}
                      </div>

                      <div className="mt-1 text-xs capitalize text-slate-500">
                        {row.bookingType ||
                          booking.bookingType ||
                          "—"}
                      </div>

                      {row._recordType === "rejected-assignment" && (
                        <span className="mt-1 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                          Driver Rejected
                        </span>
                      )}
                    </TableCell>

                    {/* CUSTOMER */}
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {customerName}
                      </div>

                      <div className="text-xs text-slate-400">
                        {booking.user?.phone ||
                          row.user?.phone ||
                          ""}
                      </div>
                    </TableCell>

                    {/* CITY / PICKUP */}
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {city}
                      </div>

                      <div className="max-w-[200px] truncate text-xs text-slate-500">
                        {pickup}
                      </div>
                    </TableCell>

                    {/* VEHICLE */}
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {vehicle}
                      </div>

                      <div className="text-xs capitalize text-slate-500">
                        {booking.vehicle?.transmission ||
                          row.vehicle?.transmission ||
                          "—"}
                        {" / "}
                        {booking.vehicle?.fuel ||
                          row.vehicle?.fuel ||
                          "—"}
                      </div>
                    </TableCell>

                    {/* DRIVER */}
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {row.driver?.name || "—"}
                      </div>

                      <div className="text-xs text-slate-400">
                        {row.driver?.phone ||
                          (row.rejectedDriverId
                            ? `Driver ID: ${String(
                              row.rejectedDriverId
                            ).slice(-8)}`
                            : "")}
                      </div>
                    </TableCell>

                    {/* REASON */}
                    <TableCell>
                      <div className="max-w-[180px] whitespace-normal break-words text-sm text-slate-600">
                        {row.reason || "—"}
                      </div>
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(amount)}
                      </div>

                      <div className="text-xs capitalize text-slate-500">
                        {row.paymentStatus ||
                          booking.payment?.status ||
                          "—"}
                      </div>

                      {row.premiumOpted && (
                        <div className="mt-1 text-xs text-amber-600">
                          Premium +{formatCurrency(row.premiumPrice)}
                        </div>
                      )}
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <span
                        className={`badge ${getStatusClass(
                          row.status
                        )} capitalize`}
                      >
                        {row.status || "Pending"}
                      </span>
                    </TableCell>

                    {/* DATE */}
                    <TableCell className="whitespace-nowrap !text-slate-500">
                      {formatDate(row.requestedAt)}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="center">
                      {row._recordType === "cancel-request" ? (
                        <>
                          <IconButton
                            size="small"
                            onClick={(event) =>
                              handleMenuOpen(event, row)
                            }
                            className="!rounded-lg hover:!bg-slate-100"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={
                              Boolean(anchorEl) &&
                              selectedRow?._id === row._id
                            }
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              onClick={() => openModal("approve")}
                            >
                              Approve
                            </MenuItem>

                            <MenuItem
                              onClick={() => openModal("reject")}
                            >
                              Reject
                            </MenuItem>

                            <MenuItem
                              onClick={() => openModal("reassign")}
                            >
                              Reassign Driver
                            </MenuItem>
                          </Menu>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No Actions
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {data.length > ROWS_PER_PAGE && (
        <Stack
          alignItems="center"
          className="mt-5"
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}

      {/* ACTION MODAL */}
      <Modal
        title={
          actionType === "approve"
            ? "Approve Cancellation Request"
            : actionType === "reject"
              ? "Reject Cancellation Request"
              : "Reassign Driver"
        }
        open={modalOpen}
        onCancel={() => {
          if (!loading) setModalOpen(false);
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={
          actionType === "approve"
            ? "Approve"
            : actionType === "reject"
              ? "Reject"
              : "Reassign"
        }
        destroyOnClose
      >
        {/* BOOKING DETAILS */}
        {selectedRow && (
          <div className="mb-4 rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              Booking ID
            </p>

            <p className="font-semibold text-slate-800">
              {selectedRow.booking?.bookingNumber ||
                selectedRow.bookingNumber ||
                "—"}
            </p>
          </div>
        )}

        {/* ADMIN NOTE */}
        {(actionType === "approve" ||
          actionType === "reject") && (
            <Input.TextArea
              rows={4}
              placeholder="Enter admin note..."
              value={adminNote}
              onChange={(event) =>
                setAdminNote(event.target.value)
              }
              maxLength={500}
              showCount
            />
          )}

        {/* DRIVER SELECT */}
        {actionType === "reassign" && (
          <Select
            showSearch
            allowClear
            placeholder="Search and select driver"
            style={{ width: "100%" }}
            value={selectedDriver || undefined}
            onChange={(value) => setSelectedDriver(value)}
            onSearch={(value) => setDriverSearch(value)}
            filterOption={false}
            notFoundContent="No drivers found"
          >
            {drivers.map((driver) => (
              <Option
                key={driver._id}
                value={driver._id}
              >
                {driver.name}
                {driver.phone
                  ? ` - ${driver.phone}`
                  : ""}
              </Option>
            ))}
          </Select>
        )}
      </Modal>
    </div>
  );
}
