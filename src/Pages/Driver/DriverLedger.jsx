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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Driver Ledger
              </h1>
              {driver && (
                <p className="text-gray-500">
                  {driver.name} {driver.lastName} • {driver.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Wallet Balance</p>
              <p className={`text-2xl font-bold ${driver?.walletBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{driver?.walletBalance || 0}
              </p>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, padding: "8px 24px" }}
            >
              Settle Balance
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <TableContainer component={Paper} className="shadow-sm rounded-xl overflow-hidden border border-gray-100">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
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
                  <TableCell colSpan={5} align="center" className="py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-gray-600">
                      {moment(t.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        t.type === 'credit' ? 'bg-green-100 text-green-700' :
                        t.type === 'debit' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        t.type === 'credit' ? 'text-green-600' :
                        t.type === 'debit' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {t.type === 'credit' ? '+' : t.type === 'debit' ? '-' : ''}₹{t.amount}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-700">
                      ₹{t.balanceAfter}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate" title={t.description}>
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
        <DialogTitle className="font-bold border-b">Settle Driver Wallet</DialogTitle>
        <DialogContent className="space-y-6 pt-6">
          <FormControl fullWidth className="mt-4">
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
        <DialogActions className="p-4 border-t">
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSettle} variant="contained" color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
