import React, { useEffect, useState, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Menu, MenuItem, Pagination, Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import toast from "react-hot-toast";
import { Modal, Select } from "antd";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import { getTripCancelRequests, updateTripCancelRequest } from "../../Services/BookingApi";

const { Option } = Select;

export default function TripCancelRequestList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTripCancelRequests({ page, limit: 10, status: "pending" });
      if (res?.status) {
        setData(res.data || []);
        setStats(res.stats);
        setTotalPages(res.totalPage || 1);
      }
    } catch {
      toast.error("Failed to load trip cancel requests");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async () => {
    if (!selected || !action) return;
    try {
      const res = await updateTripCancelRequest(selected._id, { status: action, adminNote });
      if (res?.status) {
        toast.success(`Request ${action}`);
        setModalOpen(false);
        setAdminNote("");
        fetchData();
      }
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <Breaker />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Trip Cancel Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Drivers requesting to cancel hourly / weekly / monthly trips. Approve or reject each request.
        </p>
        {stats && (
          <p className="text-xs text-gray-400 mt-2">
            Total: {stats.total} · Pending: {stats.pendingCount ?? data.length}
          </p>
        )}
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-sm">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#111827" }}>
              {["#", "Driver", "Booking Type", "Reason", "Requested", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "#fff", fontWeight: 600 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!data.length ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#6b7280" }}>
                  No pending trip cancel requests. This is normal if no driver has requested cancellation.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={row._id}>
                  <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{row.driverId?.name || "—"}</div>
                    <div className="text-xs text-gray-500">{row.driverId?.phone}</div>
                  </TableCell>
                  <TableCell className="capitalize">{row.bookingType || "—"}</TableCell>
                  <TableCell>{row.reason || "—"}</TableCell>
                  <TableCell>{row.requestedAt ? new Date(row.requestedAt).toLocaleString("en-IN") : "—"}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelected(row); }}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selected?._id === row._id} onClose={() => setAnchorEl(null)}>
                      <MenuItem onClick={() => { setAction("approved"); setModalOpen(true); setAnchorEl(null); }}>Approve</MenuItem>
                      <MenuItem onClick={() => { setAction("rejected"); setModalOpen(true); setAnchorEl(null); }}>Reject</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack alignItems="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
        </Stack>
      )}

      <Modal
        title={action === "approved" ? "Approve Cancel Request" : "Reject Cancel Request"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleAction}
      >
        <textarea
          className="w-full border rounded-lg p-3 text-sm"
          rows={3}
          placeholder="Admin note (optional)"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}
