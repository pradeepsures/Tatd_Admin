import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
import { useEffect, useState, useCallback } from "react";
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
import Switch from "@mui/material/Switch";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Checkbox,
} from "antd";

import toast from "react-hot-toast";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import {
  getAllVehiclePreferenceCategories,
  createVehiclePreferenceCategoryApi,
  updateVehiclePreferenceCategoryApi,
  deleteVehiclePreferenceCategoryApi,
  toggleVehiclePreferenceCategoryStatusApi,
} from "../../Services/VehiclePreferenceCategoryApi";

import {
  getAllVehiclePreferences,
} from "../../Services/VehiclePreferenceApi";

// ─────────────────────────────
// TABLE STYLE
// ─────────────────────────────
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

export default function VehiclePreferenceCategoryList() {
  const [data, setData] = useState([]);
  const [vehiclePreferences, setVehiclePreferences] = useState([]);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);

  // FILTERS
  const [tempSearch, setTempSearch] = useAdminListState("tempSearch", "");
  const [search, setSearch] = useAdminListState("search", "");

  const [statusFilter, setStatusFilter] = useAdminListState("statusFilter", "");
  const [vehiclePreferenceFilter, setVehiclePreferenceFilter] = useAdminListState("vehiclePreferenceFilter", "");

  const [appliedStatus, setAppliedStatus] = useAdminListState("appliedStatus", "");
  const [appliedVehiclePreference, setAppliedVehiclePreference] = useAdminListState("appliedVehiclePreference", "");

  // MODALS
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // MENU
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // EDIT ID
  const [editId, setEditId] = useState(null);

  // ─────────────────────────────
  // FETCH DATA
  // ─────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res =
        await getAllVehiclePreferenceCategories({
          page,
          limit: rowsPerPage,
          search,
          status: appliedStatus,
          vehiclePreference: appliedVehiclePreference,
        });

      if (res?.status) {
        setData(res.data || []);
        setTotalPages(res.totalPage || 1);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, search, appliedStatus, appliedVehiclePreference]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─────────────────────────────
  // FETCH VEHICLE PREFERENCES
  // ─────────────────────────────
  useEffect(() => {
    (async () => {
      const res = await getAllVehiclePreferences({
        page: 1,
        limit: 100,
      });

      if (res?.status) {
        setVehiclePreferences(res.data || []);
      }
    })();
  }, []);

  // ─────────────────────────────
  // FILTERS
  // ─────────────────────────────
  const applyFilters = () => {
    setSearch(tempSearch.trim());
    setAppliedStatus(statusFilter);
    setAppliedVehiclePreference(vehiclePreferenceFilter);
    setPage(1);
  };

  const clearFilters = () => {
    setTempSearch("");
    setSearch("");

    setStatusFilter("");
    setVehiclePreferenceFilter("");

    setAppliedStatus("");
    setAppliedVehiclePreference("");

    setPage(1);
  };

  // ─────────────────────────────
  // TOGGLE
  // ─────────────────────────────
  const handleToggle = async (id) => {
    try {
      await toggleVehiclePreferenceCategoryStatusApi(id);

      toast.success("Status updated");

      fetchData();
    } catch {
      toast.error("Toggle failed");
    }
  };

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Category",
      content: "Are you sure?",
      okType: "danger",

      onOk: async () => {
        await deleteVehiclePreferenceCategoryApi(id);

        toast.success("Deleted successfully");

        fetchData();
      },
    });
  };

  // ─────────────────────────────
  // CREATE
  // ─────────────────────────────
  const handleCreate = async (values) => {
    try {
      await createVehiclePreferenceCategoryApi({
        name: values.name.trim(),
        status: values.status,
        vehiclePreference: values.vehiclePreference,
      });

      toast.success("Created successfully");

      setCreateModal(false);

      createForm.resetFields();

      fetchData();
    } catch {
      toast.error("Create failed");
    }
  };

  // ─────────────────────────────
  // OPEN EDIT
  // ─────────────────────────────
  const openEdit = (row) => {
    setEditId(row._id);

    editForm.setFieldsValue({
      name: row.name,
      status: row.status,
      vehiclePreference: row.vehiclePreference?._id,
    });

    setEditModal(true);

    closeMenu();
  };

  // ─────────────────────────────
  // UPDATE
  // ─────────────────────────────
  const handleUpdate = async (values) => {
    try {
      await updateVehiclePreferenceCategoryApi(editId, {
        name: values.name.trim(),
        status: values.status,
        vehiclePreference: values.vehiclePreference,
      });

      toast.success("Updated successfully");

      setEditModal(false);

      editForm.resetFields();

      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  // ─────────────────────────────
  // MENU
  // ─────────────────────────────
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
          <h1 className="page-title">Vehicle Preference Categories</h1>
        </div>

        {/* CREATE */}
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
          {/* SEARCH */}
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="search-field"
              placeholder="Search category"
              value={tempSearch}
              onChange={(e) =>
                setTempSearch(e.target.value)
              }
            />
          </div>

          {/* VEHICLE PREFERENCE */}
          <Select
            allowClear
            placeholder="Vehicle Preference"
            className="w-full sm:!w-56"
            style={{ height: 40 }}
            value={vehiclePreferenceFilter || undefined}
            onChange={(v) =>
              setVehiclePreferenceFilter(v || "")
            }
          >
            {vehiclePreferences.map((item) => (
              <Select.Option
                key={item._id}
                value={item._id}
              >
                {item.name}
              </Select.Option>
            ))}
          </Select>

          {/* STATUS */}
          <Select
            allowClear
            placeholder="Status"
            className="w-full sm:!w-40"
            style={{ height: 40 }}
            value={statusFilter || undefined}
            onChange={(v) =>
              setStatusFilter(v || "")
            }
          >
            <Select.Option value="true">
              Active
            </Select.Option>

            <Select.Option value="false">
              Inactive
            </Select.Option>
          </Select>

          <div className="flex gap-2.5">
            {/* APPLY */}
            <button
              onClick={applyFilters}
              className="btn-primary flex-1 sm:flex-none"
            >
              Apply
            </button>

            {/* CLEAR */}
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

              <StyledTableCell>
                Category Name
              </StyledTableCell>

              <StyledTableCell>
                Vehicle Preference
              </StyledTableCell>

              <StyledTableCell>Status</StyledTableCell>

              <StyledTableCell>
                Created
              </StyledTableCell>

              <StyledTableCell>
                Action
              </StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, i) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell>
                  {(page - 1) * rowsPerPage + i + 1}
                </StyledTableCell>

                <StyledTableCell className="!font-semibold !text-slate-900">
                  {row.name}
                </StyledTableCell>

                <StyledTableCell>
                  {row.vehiclePreference?.name}
                </StyledTableCell>

                <StyledTableCell>
                  <div className="flex items-center gap-3">
                  <span className={row.status ? "badge-success" : "badge-danger"}>
                    {row.status
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <Switch
                    checked={row.status}
                    onChange={() =>
                      handleToggle(row._id)
                    }
                  />
                  </div>
                </StyledTableCell>

                <StyledTableCell>
                  {new Date(
                    row.createdAt
                  ).toLocaleDateString()}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton
                    onClick={(e) =>
                      openMenu(e, row._id)
                    }
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={menuId === row._id}
                    onClose={closeMenu}
                  >
                    <MenuItem
                      onClick={() =>
                        openEdit(row)
                      }
                    >
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        handleDelete(row._id);
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
        title="Create Category"
      >
        <Form
          form={createForm}
          onFinish={handleCreate}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="vehiclePreference"
            label="Vehicle Preference"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Vehicle Preference">
              {vehiclePreferences.map((item) => (
                <Select.Option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="mt-2 h-11 w-full !rounded-xl"
          >
            Create
          </Button>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={null}
        title="Update Category"
      >
        <Form
          form={editForm}
          onFinish={handleUpdate}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="vehiclePreference"
            label="Vehicle Preference"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Vehicle Preference">
              {vehiclePreferences.map((item) => (
                <Select.Option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="mt-2 h-11 w-full !rounded-xl"
          >
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}