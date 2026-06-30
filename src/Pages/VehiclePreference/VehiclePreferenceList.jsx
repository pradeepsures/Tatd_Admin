import * as React from "react";
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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
}));

export default function VehiclePreferenceList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");

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
    <div className="p-6">
      <Breaker />

      {/* FILTER */}
      <div className="flex gap-2 mb-4 mt-6">
        <input
          className="border p-2 rounded-lg"
          placeholder="Search..."
          value={tempSearch}
          onChange={(e) => setTempSearch(e.target.value)}
        />

        <button
          onClick={applySearch}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium"
        >
          Search
        </button>

        <button
          onClick={clearSearch}
          className="bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium shadow"
        >
          Clear
        </button>

        <button
          onClick={() => setCreateModal(true)}
          className="bg-green-600 text-white px-3 ml-auto rounded-xl"
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
                  <img src={row.image} className="w-10 h-10" />
                </StyledTableCell>

                <StyledTableCell>{row.name}</StyledTableCell>

                <StyledTableCell>
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      row.status ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {row.status ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={row.status}
                    onChange={() => handleToggle(row._id)}
                  />
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
            className="w-full h-11 rounded-lg"
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
            className="w-full h-11 rounded-lg"
          >
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
