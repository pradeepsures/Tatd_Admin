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

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Modal, Form, Input, Button, TimePicker } from "antd";

import dayjs from "dayjs";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getAllNightTimes,
  getNightTimeById,
  createNightTimeApi,
  updateNightTimeApi,
  deleteNightTime,
} from "../../Services/NightTimeApi";

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
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
}));

export default function NightTimesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [editingNightTime, setEditingNightTime] = useState(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // ───────────────────────────────
  // FETCH DATA
  // ───────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllNightTimes({
        page,
        rowsPerPage,
      });

      if (res?.status) {
        setData((res.data || []).map((i) => ({ ...i, id: i._id })));
        setTotalPages(res.totalPage || 1);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ───────────────────────────────
  // MENU
  // ───────────────────────────────
  const openMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  // ───────────────────────────────
  // CREATE
  // ───────────────────────────────
  const handleCreate = async (values) => {
    try {
      await createNightTimeApi({
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      });

      setCreateModal(false);
      createForm.resetFields();

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // ───────────────────────────────
  // EDIT
  // ───────────────────────────────
  const openEdit = async (id) => {
    try {
      const res = await getNightTimeById(id);

      if (res?.status) {
        setEditingNightTime(res.data);

        editForm.setFieldsValue({
          startTime: dayjs(res.data.startTime, "HH:mm"),
          endTime: dayjs(res.data.endTime, "HH:mm"),
        });

        setEditModal(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async (values) => {
    try {
      await updateNightTimeApi(editingNightTime._id, {
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      });

      setEditModal(false);

      editForm.resetFields();

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // ───────────────────────────────
  // DELETE
  // ───────────────────────────────
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Night Time",
      content: "Are you sure?",
      okType: "danger",

      onOk: async () => {
        await deleteNightTime(id);
        fetchData();
      },
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Night Times
        </h2>

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
              <StyledTableCell>Start Time</StyledTableCell>
              <StyledTableCell>End Time</StyledTableCell>
              <StyledTableCell>Created</StyledTableCell>
              <StyledTableCell align="center">
                Action
              </StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, i) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell>
                  {(page - 1) * rowsPerPage + i + 1}
                </StyledTableCell>

                <StyledTableCell>
                  {row.startTime}
                </StyledTableCell>

                <StyledTableCell>
                  {row.endTime}
                </StyledTableCell>

                <StyledTableCell>
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "N/A"}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton
                    onClick={(e) => openMenu(e, row.id)}
                  >
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
        onCancel={() => {
          setCreateModal(false);
          createForm.resetFields();
        }}
        footer={null}
        title="Create Night Time"
      >
        <Form
          form={createForm}
          onFinish={handleCreate}
          layout="vertical"
        >
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[
              {
                required: true,
                message: "Please select start time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[
              {
                required: true,
                message: "Please select end time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-11 rounded-lg"
          >
            Create
          </Button>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={editModal}
        onCancel={() => {
          setEditModal(false);
          editForm.resetFields();
        }}
        footer={null}
        title="Update Night Time"
      >
        <Form
          form={editForm}
          onFinish={handleUpdate}
          layout="vertical"
        >
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[
              {
                required: true,
                message: "Please select start time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[
              {
                required: true,
                message: "Please select end time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-11 rounded-lg"
          >
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}