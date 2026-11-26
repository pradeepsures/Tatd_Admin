import React, { useEffect, useState, useCallback } from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
  const [page, setPage] = useAdminListState("page", 1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTripCancelRequests({ page, limit: 10 });
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
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div className="max-w-2xl">
          <h1 className="page-title">Trip Cancel Requests</h1>
          <p className="page-subtitle">
            Drivers requesting to cancel hourly / weekly / monthly trips. Approve or reject requests and view history.
          </p>
        </div>
        {stats && (
          <div className="page-actions">
            <span className="badge-neutral !px-3 !py-1">
              Total: {stats.total}
            </span>
            <span className="badge-warning !px-3 !py-1">
              Pending: {stats.pendingCount ?? data.length}
            </span>
          </div>
        )}
      </div>

      <TableContainer component={Paper} className="overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              {["#", "Driver", "Booking Type", "Reason", "Status", "Requested", "Actions"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    background: "#f9fafb",
                    color: "#667085",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: "1px solid rgba(16,24,40,0.08)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!data.length ? (
              <TableRow>
                <TableCell colSpan={7} align="center" className="!py-14 !text-slate-400">
                  No trip cancel requests found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={row._id}>
                  <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-800">{row.driverId?.name || "—"}</div>
                    <div className="text-xs text-slate-500">{row.driverId?.phone}</div>
                  </TableCell>
                  <TableCell className="capitalize">{row.bookingType || "—"}</TableCell>
                  <TableCell className="max-w-xs !text-slate-600">{row.reason || "No Reason Provided"}</TableCell>
                  <TableCell>
                    <span
                      className={`whitespace-nowrap ${
                        row.status === "approved"
                          ? "badge-success"
                          : row.status === "rejected"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {row.status?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap !text-slate-500">{row.requestedAt ? new Date(row.requestedAt).toLocaleString("en-IN") : "—"}</TableCell>
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
        <Stack alignItems="center" mt={2}>
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
          className="field mt-2"
          rows={3}
          placeholder="Admin note (optional)"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}
