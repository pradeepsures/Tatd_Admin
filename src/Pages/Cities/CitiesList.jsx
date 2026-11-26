import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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

export default function CitiesList() {
  const [data, setData] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const rowsPerPage = 10;

  // SEARCH + FILTER STATES (TEMP)
  const [search, setSearch] = useAdminListState("search", "");
  const [tempSearch, setTempSearch] = useAdminListState("tempSearch", "");

  const [stateFilter, setStateFilter] = useAdminListState("stateFilter", "");
  const [statusFilter, setStatusFilter] = useAdminListState("statusFilter", "");

  // ACTIVE FILTERS (APPLIED)
  const [appliedSearch, setAppliedSearch] = useAdminListState("appliedSearch", "");
  const [appliedState, setAppliedState] = useAdminListState("appliedState", "");
  const [appliedStatus, setAppliedStatus] = useAdminListState("appliedStatus", "");

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
    <div className="page-shell">
      <Breaker />

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cities</h1>
        </div>
        <div className="page-actions">
          <button
            onClick={() => setCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card card-pad">
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
          {/* <input
            className="border px-3 py-2 rounded"
            placeholder="Search city"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
          /> */}

          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="search-field"
              placeholder="Search city"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
          </div>

          <Select
            allowClear
            placeholder="State"
            className="w-full sm:!w-44"
            style={{ height: 40 }}
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
            className="w-full sm:!w-40"
            style={{ height: 40 }}
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
          >
            <Select.Option value="true">Active</Select.Option>
            <Select.Option value="false">Inactive</Select.Option>
          </Select>

          <div className="flex gap-2.5">
            <button
              onClick={applyFilters}
              className="btn-primary flex-1 sm:flex-none"
            >
              Apply
            </button>

            <button
              onClick={clearFilters}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper} className="overflow-hidden">
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

                <StyledTableCell className="!font-semibold !text-slate-900">{row.name}</StyledTableCell>

                <StyledTableCell>{row.state?.name.name}</StyledTableCell>

                <StyledTableCell>
                  <div className="flex items-center gap-3">
                  <span className={row.status ? "badge-success" : "badge-danger"}>
                    {row.status ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={row.status}
                    onChange={() => handleToggle(row.id)}
                  />
                  </div>
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
      <Stack alignItems="center" mt={1}>
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

          <div className="mt-2 flex justify-end border-t border-slate-200/70 pt-5">
          <Button type="primary" htmlType="submit">
            Create
          </Button>
          </div>
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

          <div className="mt-2 flex justify-end border-t border-slate-200/70 pt-5">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
