import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { styled } from "@mui/material/styles";
import {
  Table, TableBody, TableCell, tableCellClasses,
  TableContainer, TableHead, TableRow, Paper,
  IconButton, Menu, MenuItem, Pagination, Stack
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal, Input } from "antd";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { motion } from "framer-motion";

import {
  getAllPlatformDependencies,
  createPlatformDependency,
  updatePlatformDependency,
  deletePlatformDependency,
} from "../../Services/PlatformDependenciesApi";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

// ✅ Styled UI
const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
  "&:hover": { backgroundColor: "#f1f5f9" },
}));

export default function PlatformDependenciesList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    userAppVersion: "",
    driverAppVersion: "",
    googleMapKey: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ FETCH
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllPlatformDependencies();
      if (res?.status) setData(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ MENU
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // ✅ DELETE
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Platform",
      content: "Are you sure?",
      okType: "danger",
      onOk: async () => {
        const res = await deletePlatformDependency(id);
        if (res?.status) {
          toast.success("Deleted successfully");
          fetchData();
        }
      },
    });
    setAnchorEl(null);
  };

  // ✅ ADD
  const openAddModal = () => {
    setIsEdit(false);
    setSelectedRow(null);
    setForm({
      userAppVersion: "",
      driverAppVersion: "",
      googleMapKey: "",
    });
    setModalOpen(true);
  };

  // ✅ EDIT
  const openEditModal = () => {
    if (!selectedRow) return;

    setIsEdit(true);
    setForm(selectedRow.name || {});
    setModalOpen(true);
    setAnchorEl(null);
  };

  // ✅ SUBMIT (FIXED)
  const handleSubmit = async () => {
    if (!form.userAppVersion || !form.driverAppVersion || !form.googleMapKey) {
      return toast.error("All fields are required");
    }

    setBtnLoading(true);

    try {
      let res;

      if (isEdit) {
        if (!selectedRow?._id) {
          toast.error("Something went wrong");
          return;
        }
        res = await updatePlatformDependency(selectedRow._id, { name: form });
      } else {
        res = await createPlatformDependency({ name: form });
      }

      if (res?.status) {
        toast.success(isEdit ? "Updated successfully" : "Created successfully");
        setModalOpen(false);
        fetchData();
      }
    } finally {
      setBtnLoading(false);
    }
  };

  // ✅ EXPORT
  const handleExport = () => {
    if (!data.length) return toast.error("No data");

    setIsExporting(true);

    xlsx([
      {
        sheet: "Platform",
        columns: [
          { label: "User Version", value: (r) => r.name.userAppVersion },
          { label: "Driver Version", value: (r) => r.name.driverAppVersion },
          { label: "Map Key", value: (r) => r.name.googleMapKey },
          {
            label: "Created At",
            value: (r) =>
              new Date(r.createdAt).toLocaleString(),
          },
        ],
        content: data,
      },
    ]);

    setIsExporting(false);
  };

  // if (loading) return <Loader />;

  if (authLoading.profile) return <Loader />;

  if (!auth.user) {
    navigate("/login");
    return null;
  }

  const paginatedData = data.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* HEADER */}
      <div className="flex justify-end gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {isExporting ? <LoderBtn /> : "Export"}
        </motion.button>

        {/* <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Add
        </motion.button> */}
        {hasPermission("PlatformDependencies", "create") && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Add
          </motion.button>
        )}
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>User Version</StyledTableCell>
              <StyledTableCell>Driver Version</StyledTableCell>
              <StyledTableCell>Map Key</StyledTableCell>
              <StyledTableCell>Created At</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, i) => (
              <StyledTableRow key={row._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{row.name?.userAppVersion}</TableCell>
                <TableCell>{row.name?.driverAppVersion}</TableCell>
                <TableCell>{row.name?.googleMapKey}</TableCell>
                <TableCell>
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuOpen(e, row)}>
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
                    {hasPermission("PlatformDependencies", "update") && (
                      <MenuItem onClick={openEditModal}>
                        <PencilIcon className="h-5 w-5 mr-2 text-green-600" />
                        Edit
                      </MenuItem>
                    )}

                    {hasPermission("PlatformDependencies", "delete") && (
                      <MenuItem onClick={() => handleDelete(row._id)}>
                        <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
                        Delete
                      </MenuItem>
                    )}
                    {/* <MenuItem onClick={openEditModal}>
                      <PencilIcon className="h-5 w-5 mr-2 text-green-600" />
                      Edit
                    </MenuItem>

                    <MenuItem onClick={() => handleDelete(row._id)}>
                      <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
                      Delete
                    </MenuItem> */}
                  </Menu>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Stack alignItems="center" mt={4}>
        <Pagination
          count={Math.ceil(data.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
        />
      </Stack>

      {/* MODAL */}
      <Modal
        title={isEdit ? "Update Platform" : "Create Platform"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={btnLoading ? "Saving..." : "Save"}
      >
        <div className="space-y-5 mt-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              User App Version
            </label>
            <Input
              value={form.userAppVersion}
              onChange={(e) =>
                setForm({ ...form, userAppVersion: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Driver App Version
            </label>
            <Input
              value={form.driverAppVersion}
              onChange={(e) =>
                setForm({ ...form, driverAppVersion: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Google Map Key
            </label>
            <Input
              value={form.googleMapKey}
              onChange={(e) =>
                setForm({ ...form, googleMapKey: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}