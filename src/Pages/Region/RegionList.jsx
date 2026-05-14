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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Breaker from "../../compoents/Breaker";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import {
  getAllRegions,
  deleteRegion,
  createRegionApi,
  updateRegionApi,
  getRegionById,
} from "../../Services/RegionApi";
import { Modal, Form, Input, Switch, Button } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function RegionList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // Create Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [editForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllRegions({
        page,
        rowsPerPage,
        searchQuery: searchQuery.trim(),
      });

      if (result?.status) {
        const transformed = (result.data || []).map((item) => ({
          ...item,
          id: item._id,
        }));
        setData(transformed);
        setTotalPages(result.totalPage || 1);
        setTotalRecord(result.totalResult || 0);
      } else {
        toast.error(result?.message || "Failed to load regions");
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Error loading regions");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    if (!authLoading.profile && auth.user) {
      fetchData();
    }
  }, [fetchData, authLoading.profile, auth.user]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    setSearchQuery(search.trim());
    setPage(1);
  };

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete Region",
      content: "Are you sure? This cannot be undone.",
      okText: loading ? "Deleting..." : "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await deleteRegion(id);
          if (res?.status) {
            toast.success("Region deleted!");
            fetchData();
          } else {
            toast.error(res?.message || "Delete failed");
          }
        } catch (err) {
          toast.error("Error deleting region");
        } finally {
          setLoading(false);
        }
      },
    });
    handleMenuClose();
  };

  // Create Region Modal
  const openCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreate = async (values) => {
    try {
      const res = await createRegionApi({
        name: values.name.trim(),
        state: values.state.trim(),
        isActive: values.isActive ?? true,
        radiusKm: values.radiusKm,
      });
      if (res?.status) {
        toast.success("Region created successfully!");
        setCreateModalVisible(false);
        fetchData();
      } else {
        toast.error(res?.message || "Create failed");
      }
    } catch (err) {
      toast.error("Error creating region");
    }
  };

  // Edit Region Modal
  const openEditModal = async (id) => {
    try {
      const res = await getRegionById(id);
      if (res?.status && res.data) {
        const r = res.data;
        setEditingRegion(r);
        editForm.setFieldsValue({
          name: r.name,
          state: r.state,
          isActive: r.isActive,
          radiusKm: r.radiusKm,
        });
        setEditModalVisible(true);
      } else {
        toast.error("Failed to load region");
      }
    } catch (err) {
      toast.error("Error loading region data");
    }
    handleMenuClose();
  };

  const handleUpdate = async (values) => {
    try {
      const res = await updateRegionApi(editingRegion._id, {
        name: values.name.trim(),
        state: values.state.trim(),
        isActive: values.isActive,
        radiusKm: values.radiusKm,
      });
      if (res?.status) {
        toast.success("Region updated!");
        setEditModalVisible(false);
        fetchData();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating region");
    }
  };

  // Export
  const exportFunc = async () => {
    if (data.length === 0) return toast.error("No data to export!");

    setIsExporting(true);
    const settings = {
      fileName: `Regions_${new Date().toISOString().slice(0, 10)}`,
      extraLength: 3,
      writeMode: "writeFile",
    };

    const exportSheet = [
      {
        sheet: "Regions",
        columns: [
          { label: "ID", value: (row) => row?._id || "" },
          { label: "Name", value: (row) => row?.name || "" },
          { label: "State", value: (row) => row?.state || "" },
          { label: "Status", value: (row) => (row?.isActive ? "Active" : "Inactive") },
          {
            label: "Created At",
            value: (row) => (row?.createdAt ? new Date(row.createdAt).toLocaleString() : ""),
          },
        ],
        content: data,
      },
    ];

    try {
      xlsx(exportSheet, settings);
      toast.success("Exported successfully!");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading.profile) return <Loader />;
  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breaker />
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-800">Region List</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 transition-all duration-200"
          />

          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow hover:shadow-md transition-all"
          >
            Search
          </button>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportFunc}
            disabled={isExporting}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-green-700 transition-colors"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <LoderBtn /> Exporting...
              </span>
            ) : (
              "Export Excel"
            )}
          </motion.button>

          {hasPermission("Region", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow hover:shadow-lg transition-shadow"
            >
              Add Region
            </motion.button>
          )}
        </div>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-lg overflow-hidden">
        <Table sx={{ minWidth: 700 }} aria-label="region table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>State</StyledTableCell>
              <StyledTableCell>Radius</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Created At</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={6} align="center" className="py-12 text-gray-500 text-lg">
                  {search.trim() ? "No matching regions found" : "No regions found"}
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{(page - 1) * rowsPerPage + index + 1}</StyledTableCell>
                  <StyledTableCell className="font-medium text-gray-800">{row.name || "—"}</StyledTableCell>
                  <StyledTableCell className="text-gray-700">{row.state || "—"}</StyledTableCell>
                  <StyledTableCell className="text-gray-700">{row.radiusKm != null ? `${row.radiusKm} km` : "—"}</StyledTableCell>
                  <StyledTableCell>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        row.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell className="text-gray-600">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {(hasPermission("Region", "update") || hasPermission("Region", "delete")) && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, row.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                      PaperProps={{ className: "shadow-lg rounded-lg" }}
                    >
                      {hasPermission("Region", "update") && (
                        <MenuItem
                          onClick={() => openEditModal(row.id)}
                          className="flex items-center gap-2"
                        >
                          <PencilIcon className="h-5 w-5 text-green-600" />
                          Edit
                        </MenuItem>
                      )}

                      {hasPermission("Region", "delete") && (
                        <MenuItem
                          onClick={() => deleteHandler(row.id)}
                          className="flex items-center gap-2"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
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
        title="Create New Region"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Region Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Noida, Delhi" />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[{ required: true }]}>
            <Input placeholder="e.g. Uttar Pradesh" />
          </Form.Item>
          <Form.Item name="radiusKm" label="Radius (km)" rules={[{ required: true }]}>
            <Input placeholder="e.g. 10 km" />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Create Region</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Region"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Region Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Noida" />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[{ required: true }]}>
            <Input placeholder="e.g. Uttar Pradesh" />
          </Form.Item>
          <Form.Item name="radiusKm" label="Radius (km)" rules={[{ required: true }]}>
            <Input placeholder="e.g. 10 km" />
          </Form.Item>
          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Update Region</Button>
          </div>
        </Form>
      </Modal>

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