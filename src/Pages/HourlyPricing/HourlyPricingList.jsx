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
import Switch from "@mui/material/Switch";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Modal } from "antd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

import toast from "react-hot-toast";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import {
  getHourlyPricing,
  createHourlyPricing,
  updateHourlyPricing,
  deleteHourlyPricing,
  toggleHourlyPricingStatus,
} from "../../services/HourlyPricingApi";

// ───────────────────────────────

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
}));

// ───────────────────────────────

const emptyForm = {
  nightFare: "",
  roundTripFare: "",
  oneWayFare: "",
  gstPercent: "",
};

export default function HourlyPricingList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // MENU
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // MODAL
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // ───────────────────────────────
  // FETCH
  // ───────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getHourlyPricing({
        page,
        limit: rowsPerPage,
      });

      if (res?.status) {
        setData(res.data || []);
        setTotalPages(res.totalPage || 1);
      }
    } catch {
      toast.error("Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // ───────────────────────────────
  // CREATE OPEN
  // ───────────────────────────────
  const handleCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setOpen(true);
  };

  // ───────────────────────────────
  // EDIT OPEN
  // ───────────────────────────────
  const handleEdit = (item) => {
    setEditingItem(item);

    setForm({
      nightFare: item.nightFare,
      roundTripFare: item.roundTripFare,
      oneWayFare: item.oneWayFare,
      gstPercent: item.gstPercent,
    });

    setOpen(true);
    closeMenu();
  };

  // ───────────────────────────────
  // SUBMIT
  // ───────────────────────────────
  const handleSubmit = async () => {
    try {
      const payload = {
        nightFare: Number(form.nightFare),
        roundTripFare: Number(form.roundTripFare),
        oneWayFare: Number(form.oneWayFare),
        gstPercent: Number(form.gstPercent),
      };

      if (editingItem) {
        await updateHourlyPricing(editingItem._id, payload);
        toast.success("Updated successfully");
      } else {
        await createHourlyPricing(payload);
        toast.success("Created successfully");
      }

      setOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ───────────────────────────────
  // DELETE
  // ───────────────────────────────
  // const handleDelete = (item) => {
  //   closeMenu();

  //   toast((t) => (
  //     <div>
  //       <p>Delete this pricing?</p>
  //       <button
  //         onClick={async () => {
  //           toast.dismiss(t.id);
  //           await deleteHourlyPricing(item._id);
  //           toast.success("Deleted");
  //           fetchData();
  //         }}
  //       >
  //         Yes
  //       </button>
  //     </div>
  //   ));
  // };

  const handleDelete = (item) => {
    closeMenu();

    Modal.confirm({
      title: "Delete Pricing",
      content: "Are you sure you want to delete this pricing?",
      okType: "danger",
      okText: "Yes, Delete",
      cancelText: "Cancel",

      onOk: async () => {
        try {
          await deleteHourlyPricing(item._id);
          toast.success("Deleted successfully");
          fetchData();
        } catch (err) {
          console.error(err);
          toast.error("Delete failed");
        }
      },
    });
  };

  // ───────────────────────────────
  // TOGGLE
  // ───────────────────────────────
  const handleToggle = async (id) => {
    try {
      await toggleHourlyPricingStatus(id);
      fetchData();
    } catch {
      toast.error("Toggle failed");
    }
  };

  // ───────────────────────────────
  // MENU
  // ───────────────────────────────
  const openMenu = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">Hourly Pricing</h2>

        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          + Create
        </button>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>SR</StyledTableCell>
              <StyledTableCell>Night</StyledTableCell>
              <StyledTableCell>Round</StyledTableCell>
              <StyledTableCell>One Way</StyledTableCell>
              <StyledTableCell>GST</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((item, i) => (
              <StyledTableRow key={item._id}>
                <StyledTableCell>
                  {(page - 1) * rowsPerPage + i + 1}
                </StyledTableCell>

                <StyledTableCell>₹{item.nightFare}</StyledTableCell>
                <StyledTableCell>₹{item.roundTripFare}</StyledTableCell>
                <StyledTableCell>₹{item.oneWayFare}</StyledTableCell>
                <StyledTableCell>{item.gstPercent}%</StyledTableCell>

                <StyledTableCell>
                  <div className="flex items-center gap-3">
                    {/* SWITCH */}
                    <Switch
                      checked={item.isActive}
                      onChange={() => handleToggle(item._id)}
                    />

                    {/* STATUS TEXT */}
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full
        ${
          item.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }
      `}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </StyledTableCell>

                <StyledTableCell>
                  <IconButton onClick={(e) => openMenu(e, item)}>
                    <MoreVertIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Stack alignItems="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
        />
      </Stack>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => handleEdit(selectedItem)}>
          <EditIcon fontSize="small" className="mr-2 text-blue-600" />
          Edit
        </MenuItem>

        <MenuItem onClick={() => handleDelete(selectedItem)}>
          <DeleteIcon fontSize="small" className="mr-2 text-red-600" />
          Delete
        </MenuItem>
      </Menu>

      {/* MODAL */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingItem ? "Edit Pricing" : "Create Pricing"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Night Fare"
            value={form.nightFare}
            onChange={(e) => setForm({ ...form, nightFare: e.target.value })}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Round Trip Fare"
            value={form.roundTripFare}
            onChange={(e) =>
              setForm({ ...form, roundTripFare: e.target.value })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="One Way Fare"
            value={form.oneWayFare}
            onChange={(e) => setForm({ ...form, oneWayFare: e.target.value })}
          />

          <TextField
            fullWidth
            margin="dense"
            label="GST %"
            value={form.gstPercent}
            onChange={(e) => setForm({ ...form, gstPercent: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
