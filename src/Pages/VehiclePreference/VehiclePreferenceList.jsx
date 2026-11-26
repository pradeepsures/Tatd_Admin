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
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// import { Modal, Form, Input, Button } from "antd";
import { Modal, Form, Input, Button, Upload, Checkbox } from "antd";
import toast from "react-hot-toast";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import {
  getAllVehiclePreferences,
  createVehiclePreferenceApi,
  updateVehiclePreferenceApi,
  deleteVehiclePreferenceApi,
  toggleVehiclePreferenceStatusApi,
} from "../../Services/VehiclePreferenceApi";

// ─────────────────────────────
const StyledTableCell = styled(TableCell)(() => ({
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

export default function VehiclePreferenceList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useAdminListState("search", "");
  const [tempSearch, setTempSearch] = useAdminListState("tempSearch", "");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [createPreview, setCreatePreview] = useState("");
  const [editPreview, setEditPreview] = useState("");

  const [editId, setEditId] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // ─────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllVehiclePreferences({
        page,
        limit: 10,
        search,
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
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─────────────────────────────
  const applySearch = () => {
    setSearch(tempSearch);
    setPage(1);
  };

  const clearSearch = () => {
    setTempSearch("");
    setSearch("");
    setPage(1);
  };

  // ─────────────────────────────
  const handleToggle = async (id) => {
    await toggleVehiclePreferenceStatusApi(id);
    fetchData();
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete?",
      content: "Are you sure you want to delete this state?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteVehiclePreferenceApi(id);
          fetchData();
        } catch (err) {
          toast.error("Delete failed");
        }
      },
      // onOk: async () => {
      //   await deleteVehiclePreferenceApi(id);
      //   fetchData();
      // },
    });
  };

  // ─────────────────────────────
  // const handleCreate = async (values) => {
  //   await createVehiclePreferenceApi(values);
  //   setCreateModal(false);
  //   form.resetFields();
  //   fetchData();
  // };
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      formData.append("name", values.name?.trim() || "");
      formData.append("status", values.status ? "true" : "false");

      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await createVehiclePreferenceApi(formData);

      toast.success("Created successfully");

      setCreateModal(false);
      setCreatePreview("");
      form.resetFields();

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Create failed");
    }
  };

  const openEdit = (row) => {
    setEditModal(true);

    editForm.setFieldsValue({
      name: row.name,
      status: row.status,
    });

    setEditPreview(row.image);

    setEditId(row._id);

    setAnchorEl(null);
  };

  // const handleUpdate = async (values) => {
  //   await updateVehiclePreferenceApi(selectedId, values);
  //   setEditModal(false);
  //   fetchData();
  // };
  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();

      const formData = new FormData();

      formData.append("name", values.name?.trim() || "");
      formData.append("status", values.status ? "true" : "false");

      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await updateVehiclePreferenceApi(editId, formData);

      toast.success("Updated successfully");

      setEditModal(false);
      setEditPreview("");

      editForm.resetFields();

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Update failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Preferences</h1>
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

      {/* FILTER */}
      <div className="card card-pad">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="search-field sm:w-96"
              placeholder="Search..."
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={applySearch}
              className="btn-primary flex-1 sm:flex-none"
            >
              Search
            </button>

            <button
              onClick={clearSearch}
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
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, i) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell>{i + 1}</StyledTableCell>

                <StyledTableCell>
                  <img src={row.image} alt={row.name} className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-black/5" />
                </StyledTableCell>

                <StyledTableCell className="!font-semibold !text-slate-900">{row.name}</StyledTableCell>

                <StyledTableCell>
                  <div className="flex items-center gap-3">
                  <span className={row.status ? "badge-success" : "badge-danger"}>
                    {row.status ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={row.status}
                    onChange={() => handleToggle(row._id)}
                  />
                  </div>
                </StyledTableCell>

                <StyledTableCell>
                  <IconButton
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setMenuId(row._id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={menuId === row._id}
                    onClose={() => {
                      setMenuId(null);
                      setAnchorEl(null);
                    }}
                  >
                    {/* <MenuItem onClick={() => openEdit(row)}>
                     <PencilIcon className="h-5 w-5 text-green-600" />
                    Edit
                    </MenuItem> */}
                    <MenuItem
                      onClick={() => openEdit(row)}
                      className="flex items-center gap-2"
                    >
                      <PencilIcon className="h-5 w-5 text-green-600" />
                      Edit
                    </MenuItem>

                    {/* <MenuItem onClick={() => handleDelete(row._id)}>
                      Delete
                    </MenuItem> */}
                    <MenuItem
                      onClick={() => handleDelete(row._id)}
                      className="flex items-center gap-2"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
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
        title="Create Vehicle Preference"
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter vehicle preference name" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              const file = e?.fileList?.[0];

              if (file?.originFileObj) {
                setCreatePreview(URL.createObjectURL(file.originFileObj));
              }

              return e?.fileList;
            }}
          >
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button>Select Image</Button>
            </Upload>
          </Form.Item>

          {/* {createPreview && (
            <img
              src={createPreview}
              alt="preview"
              className="w-24 h-24 object-cover rounded-lg mb-3 border"
            />
          )} */}

          <Form.Item name="status" valuePropName="checked" initialValue={true}>
            <Checkbox>Active</Checkbox>
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
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
        title="Update Vehicle Preference"
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Change Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              const file = e?.fileList?.[0];

              if (file?.originFileObj) {
                setEditPreview(URL.createObjectURL(file.originFileObj));
              }

              return e?.fileList;
            }}
          >
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button>Select New Image</Button>
            </Upload>
          </Form.Item>

          {/* {editPreview && (
            <img
              src={editPreview}
              alt="preview"
              className="w-24 h-24 object-cover rounded-lg mb-3 border"
            />
          )} */}

          <Form.Item name="status" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            className="mt-2 h-11 w-full !rounded-xl"
          >
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
