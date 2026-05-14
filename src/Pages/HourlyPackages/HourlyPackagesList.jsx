import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal, Form, Input, Switch, Button, InputNumber } from "antd";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { useAuth } from "../../auth/AuthContext";

import {
  getAllHourlyPackages,
  getHourlyPackageById,
  createHourlyPackage,
  updateHourlyPackage,
  deleteHourlyPackage,
} from "../../Services/HourlyPackageApi";

// ────────────────────────────────────────────────
// Styled Table
// ────────────────────────────────────────────────
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "12px 16px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.9rem",
    color: "#374151",
    padding: "12px 16px",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "background-color 0.2s ease",
  },
}));

export default function searchHourlyPackageList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // frontend pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  // search
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // create modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editForm] = Form.useForm();

  // ────────────────────────────────────────────────
  // Fetch Data
  // ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllHourlyPackages({
        page: 1,
        rowsPerPage: 1000,
        searchQuery,
      });

      if (result?.status === "success") {
        let transformed = (result.data || []).map((item) => ({
          ...item,
          id: item._id,
        }));

        // frontend search filter
        if (searchQuery.trim()) {
          transformed = transformed.filter(
            (item) =>
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              String(item.hours).includes(searchQuery) ||
              String(item.includedKms).includes(searchQuery)
          );
        }

        setData(transformed);
      } else {
        toast.error(result?.message || "Failed to load hourly packages");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading hourly packages");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!authLoading.profile && auth.user) {
      fetchData();
    }
  }, [fetchData, authLoading.profile, auth.user]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // ────────────────────────────────────────────────
  // Pagination
  // ────────────────────────────────────────────────
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginatedData = data.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // ────────────────────────────────────────────────
  // Search
  // ────────────────────────────────────────────────
  const handleSearch = () => {
    setSearchQuery(search.trim());
    setPage(1);
  };

  // ────────────────────────────────────────────────
  // Menu
  // ────────────────────────────────────────────────
  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  // ────────────────────────────────────────────────
  // Delete
  // ────────────────────────────────────────────────
  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete Hourly Package",
      content: "Are you sure? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await deleteHourlyPackage(id);

          if (res?.status === "success") {
            toast.success("Hourly package deleted successfully!");
            fetchData();
          } else {
            toast.error(res?.message || "Delete failed");
          }
        } catch (err) {
          toast.error("Error deleting hourly package");
        } finally {
          setLoading(false);
        }
      },
    });

    handleMenuClose();
  };

  // ────────────────────────────────────────────────
  // Create
  // ────────────────────────────────────────────────
  const openCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ status: true });
    setCreateModalVisible(true);
  };

  const handleCreate = async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        hours: values.hours,
        includedKms: values.includedKms,
        status: values.status ?? true,
      };

      const res = await createHourlyPackage(payload);

      if (res?.status === "success") {
        toast.success("Hourly package created successfully!");
        setCreateModalVisible(false);
        fetchData();
      } else {
        toast.error(res?.message || "Create failed");
      }
    } catch (err) {
      toast.error("Error creating hourly package");
    }
  };

  // ────────────────────────────────────────────────
  // Edit
  // ────────────────────────────────────────────────
  const openEditModal = async (id) => {
    try {
      const res = await getHourlyPackageById(id);

      if (res?.status === "success" && res.data) {
        const item = res.data;

        setEditingPackage(item);

        editForm.setFieldsValue({
          name: item.name,
          hours: item.hours,
          includedKms: item.includedKms,
          status: item.status,
        });

        setEditModalVisible(true);
      } else {
        toast.error("Failed to load package details");
      }
    } catch (err) {
      toast.error("Error loading package");
    }

    handleMenuClose();
  };

  const handleUpdate = async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        hours: values.hours,
        includedKms: values.includedKms,
        status: values.status,
      };

      const res = await updateHourlyPackage(editingPackage._id, payload);

      if (res?.status === "success") {
        toast.success("Hourly package updated successfully!");
        setEditModalVisible(false);
        fetchData();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating hourly package");
    }
  };

  if (authLoading.profile || loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breaker />
        {/* <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-800">
            Hourly Package List
          </span>
        </div> */}
      </div>

      {/* Top Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            Search
          </button>
        </div>

        {hasPermission("HourlyPackages", "create") && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow"
          >
            Add Hourly Package
          </motion.button>
        )}
      </div>

      {/* Table */}
      <TableContainer
        component={Paper}
        className="rounded-xl shadow-lg overflow-hidden"
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Hours</StyledTableCell>
              <StyledTableCell>Included KMs</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Created At</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={7} align="center">
                  No hourly packages found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              paginatedData.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>

                  <StyledTableCell>{row.name}</StyledTableCell>

                  <StyledTableCell>{row.hours} Hr</StyledTableCell>

                  <StyledTableCell>{row.includedKms} KM</StyledTableCell>

                  <StyledTableCell>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        row.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.status ? "Active" : "Inactive"}
                    </span>
                  </StyledTableCell>

                  <StyledTableCell>
                    {new Date(row.createdAt).toLocaleDateString("en-IN")}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {(hasPermission("HourlyPackages", "update") ||
                      hasPermission("HourlyPackages", "delete")) && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, row.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                    >
                      {hasPermission("HourlyPackages", "update") && (
                        <MenuItem onClick={() => openEditModal(row.id)}>
                          <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                          Edit
                        </MenuItem>
                      )}

                      {hasPermission("HourlyPackages", "delete") && (
                        <MenuItem onClick={() => deleteHandler(row.id)}>
                          <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                          Delete
                        </MenuItem>
                      )}
                    </Menu>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Modal */}
      <Modal
        title="Create Hourly Package"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter package name" }]}
          >
            <Input placeholder="e.g. 2 Hours" />
          </Form.Item>

          <Form.Item
            name="hours"
            label="Hours"
            rules={[{ required: true, message: "Enter hours" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="includedKms"
            label="Included KMs"
            rules={[{ required: true, message: "Enter included kms" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setCreateModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Package
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Hourly Package"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="hours"
            label="Hours"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="includedKms"
            label="Included KMs"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setEditModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Package
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" marginTop={6}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
          />
        </Stack>
      )}
    </div>
  );
}