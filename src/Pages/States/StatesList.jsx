// src/pages/States/StatesList.jsx

import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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

import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
    background: "#f9fafb",
    color: "#667085",
    fontWeight: 700,
    fontSize: "0.72rem",
    padding: "14px 16px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid rgba(16,24,40,0.08)",
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.86rem",
    color: "#1f2937",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(248,250,252,0.45)",
  },
  "&:hover": {
    backgroundColor: "rgba(16,24,40,0.08)",
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function StatesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage] = useState(10);

  const [search, setSearch] = useAdminListState("search", "");
  const [searchQuery, setSearchQuery] = useAdminListState("searchQuery", "");

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
    <div className="page-shell">
      {/* Breadcrumb */}
      <Breaker />

      {/* TOP */}
      <div className="page-header">
        <div>
          <h1 className="page-title">States</h1>
        </div>

        {/* ADD BUTTON */}
        <div className="page-actions">
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="card card-pad">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by state name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-field sm:w-96"
            />
          </div>

          <button
            onClick={handleSearch}
            className="btn-primary w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </div>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        className="overflow-hidden"
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
                <StyledTableCell colSpan={5} align="center" className="!py-14 !text-slate-400">
                  No states found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>

                  <StyledTableCell className="!font-semibold !text-slate-900">
                    {row.name || "—"}
                  </StyledTableCell>

                  <StyledTableCell>
                    <span className={row.status ? "badge-success" : "badge-danger"}>
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

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
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

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
            <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>

            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" marginTop={2}>
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
