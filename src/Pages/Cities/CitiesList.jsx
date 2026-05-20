import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Modal, Form, Input, Button, Select } from "antd";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getAllCities,
  getCityById,
  createCityApi,
  updateCityApi,
  deleteCity,
  toggleCityStatusApi,
} from "../../Services/CitiesApi";

import { getAllStates } from "../../Services/StatesApi";

// ───────────────────────────────
// TABLE STYLE
// ───────────────────────────────
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "12px 16px",
    textTransform: "uppercase",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.9rem",
    padding: "12px 16px",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
}));

export default function CitiesList() {
  const [data, setData] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // SEARCH + FILTER STATES (TEMP)
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ACTIVE FILTERS (APPLIED)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedState, setAppliedState] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const [totalPages, setTotalPages] = useState(1);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // ───────────────────────────────
  // FETCH
  // ───────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllCities({
        page,
        rowsPerPage,
        searchQuery: appliedSearch,
        state: appliedState,
        status: appliedStatus,
      });

      if (res?.status) {
        setData((res.data || []).map((i) => ({ ...i, id: i._id })));
        setTotalPages(res.totalPage || 1);
      }
    } catch {
      toast.error("Failed to load cities");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, appliedState, appliedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    (async () => {
      const res = await getAllStates({ page: 1, rowsPerPage: 1000 });
      if (res?.status) setStates(res.data || []);
    })();
  }, []);

  // ───────────────────────────────
  // APPLY FILTERS
  // ───────────────────────────────
  const applyFilters = () => {
    setAppliedSearch(tempSearch.trim());
    setAppliedState(stateFilter);
    setAppliedStatus(statusFilter);
    setPage(1);
  };

  // ───────────────────────────────
  // CLEAR FILTERS
  // ───────────────────────────────
  const clearFilters = () => {
    setTempSearch("");
    setSearch("");
    setStateFilter("");
    setStatusFilter("");

    setAppliedSearch("");
    setAppliedState("");
    setAppliedStatus("");

    setPage(1);
  };

  // ───────────────────────────────
  // TOGGLE STATUS (UI SWITCH)
  // ───────────────────────────────
  const handleToggle = async (id) => {
    try {
      await toggleCityStatusApi(id);
      fetchData();
    } catch {
      toast.error("Toggle failed");
    }
  };

  // ───────────────────────────────
  // DELETE
  // ───────────────────────────────
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete City",
      content: "Are you sure?",
      okType: "danger",
      onOk: async () => {
        await deleteCity(id);
        fetchData();
      },
    });
  };

  // ───────────────────────────────
  // CREATE
  // ───────────────────────────────
  const handleCreate = async (values) => {
    await createCityApi({
      name: values.name.trim(),
      state: values.state,
    });

    setCreateModal(false);
    createForm.resetFields();
    fetchData();
  };

  // ───────────────────────────────
  // EDIT
  // ───────────────────────────────
  const openEdit = async (id) => {
    const res = await getCityById(id);

    if (res?.status) {
      setEditingCity(res.data);
      editForm.setFieldsValue({
        name: res.data.name,
        state: res.data.state?._id,
      });
      setEditModal(true);
    }
  };

  const handleUpdate = async (values) => {
    await updateCityApi(editingCity._id, {
      name: values.name.trim(),
      state: values.state,
    });

    setEditModal(false);
    fetchData();
  };

  const openMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* HEADER */}
      <div className="flex justify-between mb-6 mt-6">
        <div className="flex gap-2 flex-wrap">
          {/* <input
            className="border px-3 py-2 rounded"
            placeholder="Search city"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
          /> */}

          <input
            className="px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Search city"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
          />

          <Select
            allowClear
            placeholder="State"
            style={{ width: 160, height: 45 }}
            value={stateFilter || undefined}
            onChange={(v) => setStateFilter(v || "")}
          >
            {states.map((s) => (
              <Select.Option key={s._id} value={s._id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>

        

          <Select
            allowClear
            placeholder="Status"
            style={{ width: 140, height: 45 }}
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
          >
            <Select.Option value="true">Active</Select.Option>
            <Select.Option value="false">Inactive</Select.Option>
          </Select>

          <button
            onClick={applyFilters}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition"
          >
            Apply
          </button>

          <button
            onClick={clearFilters}
            className="bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition"
          >
            Clear
          </button>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition"
        >
          + Create
        </button>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>City</StyledTableCell>
              <StyledTableCell>State</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              {/* <StyledTableCell>Toggle</StyledTableCell> */}
              <StyledTableCell>Created</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, i) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell>
                  {(page - 1) * rowsPerPage + i + 1}
                </StyledTableCell>

                <StyledTableCell>{row.name}</StyledTableCell>

                <StyledTableCell>{row.state?.name}</StyledTableCell>

                <StyledTableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={row.status}
                    onChange={() => handleToggle(row.id)}
                  />
                </StyledTableCell>

                {/* TOGGLE SWITCH UI */}
                {/* <StyledTableCell>
                  
                </StyledTableCell> */}

                <StyledTableCell>
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "N/A"}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton onClick={(e) => openMenu(e, row.id)}>
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={menuId === row.id}
                    onClose={closeMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        openEdit(row.id);
                        closeMenu();
                      }}
                    >
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        handleDelete(row.id);
                        closeMenu();
                      }}
                    >
                      <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                      Delete
                    </MenuItem>
                  </Menu>
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

      {/* CREATE MODAL */}
      <Modal
        open={createModal}
        onCancel={() => setCreateModal(false)}
        footer={null}
        title="Create City"
      >
        <Form form={createForm} onFinish={handleCreate}>
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input placeholder="City name" />
          </Form.Item>

          <Form.Item name="state" rules={[{ required: true }]}>
            <Select placeholder="State">
              {states.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={null}
        title="Edit City"
      >
        <Form form={editForm} onFinish={handleUpdate}>
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="state" rules={[{ required: true }]}>
            <Select>
              {states.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
