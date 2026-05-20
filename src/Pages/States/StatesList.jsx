// src/pages/States/StatesList.jsx

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
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Modal, Form, Input, Switch, Button } from "antd";

import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getAllStates,
  getStateById,
  createStateApi,
  updateStateApi,
  deleteState,
} from "../../Services/StatesApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
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

  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function StatesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [totalPages, setTotalPages] = useState(1);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // CREATE
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // EDIT
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [editForm] = Form.useForm();

  // FETCH
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllStates({
        page,
        rowsPerPage,
        searchQuery,
      });

      if (result?.status) {
        const transformed = (result.data || []).map((item) => ({
          ...item,
          id: item._id,
        }));

        setData(transformed);
        setTotalPages(result.totalPage || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load states");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // SEARCH
  const handleSearch = () => {
    setSearchQuery(search.trim());
    setPage(1);
  };

  // PAGINATION
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // MENU
  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  // DELETE
  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete State",
      content: "Are you sure you want to delete this state?",
      okText: "Delete",
      okType: "danger",

      onOk: async () => {
        try {
          await deleteState(id);
          fetchData();
        } catch (err) {
          toast.error("Delete failed");
        }
      },
    });

    handleMenuClose();
  };

  // CREATE
  const openCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreate = async (values) => {
    try {
      const res = await createStateApi({
        name: values.name.trim(),
        isActive: values.isActive ?? true,
      });

      if (res?.status) {
        setCreateModalVisible(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Create failed");
    }
  };

  // EDIT
  const openEditModal = async (id) => {
    try {
      const res = await getStateById(id);

      if (res?.status) {
        const state = res.data;

        setEditingState(state);

        editForm.setFieldsValue({
          name: state.name,
          isActive: state.isActive,
        });

        setEditModalVisible(true);
      }
    } catch (err) {
      toast.error("Failed to load state");
    }

    handleMenuClose();
  };

  const handleUpdate = async (values) => {
    try {
      const res = await updateStateApi(editingState._id, {
        name: values.name.trim(),
        isActive: values.isActive,
      });

      if (res?.status) {
        setEditModalVisible(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breaker />
      </div>

      {/* TOP */}
      <div className="flex justify-between items-center mb-8">
        {/* SEARCH */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by state name..."
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

        {/* ADD BUTTON */}
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow"
        >
          + Create
        </button>
      </div>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        className="rounded-xl shadow-lg overflow-hidden"
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>State Name</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Created At</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center">
                  No states found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>

                  <StyledTableCell className="font-medium">
                    {row.name || "—"}
                  </StyledTableCell>

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
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                      <MoreVertIcon />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => openEditModal(row.id)}
                        className="flex items-center gap-2"
                      >
                        <PencilIcon className="h-5 w-5 text-green-600" />
                        Edit
                      </MenuItem>

                      <MenuItem
                        onClick={() => deleteHandler(row.id)}
                        className="flex items-center gap-2"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                        Delete
                      </MenuItem>
                    </Menu>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE MODAL */}
      <Modal
        title="Create State"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="State Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter state name" />
          </Form.Item>

          {/* <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item> */}

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>

            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        title="Edit State"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="name"
            label="State Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter state name" />
          </Form.Item>
{/* 
          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item> */}

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>

            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* PAGINATION */}
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
