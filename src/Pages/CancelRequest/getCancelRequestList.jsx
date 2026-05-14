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

import {
  getCancelRequestsApi,
  approveCancelRequestApi,
  rejectCancelRequestApi,
  reassignCancelRequestApi,
} from "../../Services/RequestApi";

import { getAllDrivers } from "../../Services/DriverApi";

const { Option } = Select;

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function CancelRequestList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // MODAL STATES
  const [actionType, setActionType] = useState(""); // approve | reject | reassign
  const [modalOpen, setModalOpen] = useState(false);

  const [adminNote, setAdminNote] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");

  const [drivers, setDrivers] = useState([]);
  const [driverSearch, setDriverSearch] = useState("");

  const [isExporting, setIsExporting] = useState(false);

  // FETCH CANCEL REQUESTS
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCancelRequestsApi();

      if (res?.status) {
        setData(res.data || []);
      }
    } catch {
      toast.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FETCH DRIVERS
  const fetchDrivers = async (search) => {
    try {
      const res = await getAllDrivers({
        page: 1,
        rowsPerPage: 50,
        searchQuery: search || "",
      });

      if (res?.status) setDrivers(res.data || []);
    } catch {
      toast.error("Driver load failed");
    }
  };

  useEffect(() => {
    if (actionType === "reassign") {
      fetchDrivers(driverSearch);
    }
  }, [actionType, driverSearch]);

  // MENU
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // OPEN MODAL
  const openModal = (type) => {
    setActionType(type);
    setModalOpen(true);
    setAdminNote("");
    setSelectedDriver("");
    handleMenuClose();
  };

  // SUBMIT ACTION
  const handleSubmit = async () => {
    if (!selectedRow) return;

    try {
      setLoading(true);

      let res;

      if (actionType === "approve") {
        if (!adminNote) return toast.error("Enter admin note");
        res = await approveCancelRequestApi(selectedRow._id, adminNote);
      }

      if (actionType === "reject") {
        if (!adminNote) return toast.error("Enter admin note");
        res = await rejectCancelRequestApi(selectedRow._id, adminNote);
      }

      if (actionType === "reassign") {
        if (!selectedDriver) return toast.error("Select driver");
        res = await reassignCancelRequestApi(
          selectedRow.booking?._id,
          selectedDriver
        );
      }

      if (res?.status) {
        toast.success("Success");
        fetchData();
        setModalOpen(false);
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
  if (!data.length) return toast.error("No data");

  setIsExporting(true);

  const exportData = [
    {
      sheet: "Cancel Requests",
      columns: [
        { label: "Booking No", value: (r) => r.booking?.bookingNumber },
        { label: "Driver Name", value: (r) => r.driver?.name },
        { label: "Driver Phone", value: (r) => r.driver?.phone },
        { label: "Reason", value: "reason" },
        { label: "Status", value: "status" },
        { label: "Admin Note", value: "adminNote" },
        { label: "Date", value: (r) => new Date(r.requestedAt).toLocaleString() },
      ],
      content: data,
    },
  ];

  try {
    xlsx(exportData, { fileName: "Cancel_Request_List" });
  } finally {
    setIsExporting(false);
  }
};

  if (loading) return <Loader />;

  return (

    <div className="p-6 bg-gray-50 min-h-screen">

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
              <StyledTableCell>Booking</StyledTableCell>
              <StyledTableCell>Driver</StyledTableCell>
              <StyledTableCell>Reason</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!data.length ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No Requests Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row._id}>
                  <TableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    {row.booking?.bookingNumber}
                  </TableCell>

                  <TableCell>{row.driver?.name}</TableCell>

                  <TableCell>{row.reason}</TableCell>

                  <TableCell>
                    <span className="text-yellow-600 font-semibold">
                      {row.status}
                    </span>
                  </TableCell>

                  <TableCell>
                    {new Date(row.requestedAt).toLocaleString()}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, row)}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) &&
                        selectedRow?._id === row._id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => openModal("approve")}>
                        ✅ Approve
                      </MenuItem>

                      <MenuItem onClick={() => openModal("reject")}>
                        ❌ Reject
                      </MenuItem>

                      <MenuItem onClick={() => openModal("reassign")}>
                        🔁 Reassign
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL */}
      <Modal
        title={
          actionType === "approve"
            ? "Approve Request"
            : actionType === "reject"
            ? "Reject Request"
            : "Reassign Driver"
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        {(actionType === "approve" || actionType === "reject") && (
          <Input.TextArea
            rows={4}
            placeholder="Enter admin note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        )}

        {actionType === "reassign" && (
          <Select
            showSearch
            placeholder="Select driver"
            style={{ width: "100%" }}
            value={selectedDriver || undefined}
            onChange={(val) => setSelectedDriver(val)}
            onSearch={(val) => setDriverSearch(val)}
          >
            {drivers.map((d) => (
              <Option key={d._id} value={d._id}>
                {d.name}
              </Option>
            ))}
          </Select>
        )}
      </Modal>
    </div>
  );
}