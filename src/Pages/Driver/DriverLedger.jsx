import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDriverWalletTransactions, settleDriverWallet, getSingleDriver } from "../../Services/DriverApi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import moment from "moment";
import Loader from "../../compoents/Loader";
import { StyledTableCell } from "../../compoents/TableComponents";

export default function DriverLedger() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("settle_zero");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      const [driverRes, transRes] = await Promise.all([
        getSingleDriver(id),
        getDriverWalletTransactions(id)
      ]);
      if (driverRes.status) setDriver(driverRes.data);
      if (transRes.status) setTransactions(transRes.data);
    } catch (err) {
      toast.error("Failed to fetch ledger");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleSettle = async () => {
    if (actionType !== "settle_zero" && !amount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      const data = {
        action: actionType,
        amount: Number(amount),
        description
      };

      const res = await settleDriverWallet(id, data);
      if (res.status) {
        toast.success("Wallet settled successfully");
        setOpen(false);
        setAmount("");
        setDescription("");
        fetchLedger();
      }
    } catch (err) {
      toast.error("Failed to settle wallet");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-6xl space-y-5">

        {/* Header */}
        <div className="card card-pad flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="btn-icon shrink-0 border border-slate-200 bg-white/80"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="page-title">
                Driver Ledger
              </h1>
              {driver && (
                <p className="page-subtitle break-words">
                  {driver.name} {driver.lastName} • {driver.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:gap-6 sm:border-t-0 sm:pt-0">
            <div className="sm:text-right">
              <p className="detail-label">Wallet Balance</p>
              <p className={`mt-1 text-2xl font-semibold tracking-tight ${driver?.walletBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{driver?.walletBalance || 0}
              </p>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, padding: "8px 24px", height: 40, backgroundImage: "#111827", boxShadow: "0 6px 18px -6px rgba(11,15,25,0.55)", "&:hover": { boxShadow: "0 0 0 1px rgba(16,24,40,0.08), 0 10px 26px -8px rgba(11,15,25,0.6)" } }}
            >
              Settle Balance
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>DATE</StyledTableCell>
                <StyledTableCell>TYPE</StyledTableCell>
                <StyledTableCell>AMOUNT</StyledTableCell>
                <StyledTableCell>BALANCE AFTER</StyledTableCell>
                <StyledTableCell>DESCRIPTION</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="!py-14 !text-slate-400">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="whitespace-nowrap !text-slate-600">
                      {moment(t.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize ${
                        t.type === 'credit' ? 'badge-success' :
                        t.type === 'debit' ? 'badge-danger' :
                        'badge-info'
                      }`}>
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`whitespace-nowrap font-semibold ${
                        t.type === 'credit' ? 'text-emerald-600' :
                        t.type === 'debit' ? 'text-rose-600' :
                        'text-blue-600'
                      }`}>
                        {t.type === 'credit' ? '+' : t.type === 'debit' ? '-' : ''}₹{t.amount}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap !font-semibold !text-slate-800">
                      ₹{t.balanceAfter}
                    </TableCell>
                    <TableCell className="max-w-xs truncate !text-slate-600" title={t.description}>
                      {t.description || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </div>

      {/* Settle Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="border-b border-slate-200/70" sx={{ fontWeight: 800, color: "#0f172a" }}>Settle Driver Wallet</DialogTitle>
        <DialogContent className="space-y-5" sx={{ pt: "20px !important" }}>
          <FormControl fullWidth className="mt-2">
            <InputLabel>Action</InputLabel>
            <Select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              label="Action"
            >
              <MenuItem value="settle_zero">Settle to Zero (Clear Balance)</MenuItem>
              <MenuItem value="add">Add Money (Credit)</MenuItem>
              <MenuItem value="deduct">Deduct Money (Debit)</MenuItem>
            </Select>
          </FormControl>

          {actionType !== "settle_zero" && (
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}

          <TextField
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Received cash in hand"
          />
        </DialogContent>
        <DialogActions className="border-t border-slate-200/70" sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSettle} variant="contained" color="primary" sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, px: 3, backgroundImage: "#111827" }}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
